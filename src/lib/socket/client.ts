/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client, type IFrame, type IMessage } from "@stomp/stompjs";
import type {
  SessionEvent,
  SessionCommand,
  SessionEventType,
  EventData,
  ConnectionStatus,
} from "./types";

type EventCallback<T extends SessionEventType> = (data: EventData<T>) => void;

interface SocketOptions {
  maxReconnectAttempts?: number;
  reconnectInterval?: number;
  maxReconnectDelay?: number;
  debug?: boolean;
}

const DEFAULT_OPTIONS: Required<SocketOptions> = {
  maxReconnectAttempts: 5,
  reconnectInterval: 1000,
  maxReconnectDelay: 30000, // 최대 30초
  debug: process.env.NODE_ENV === "development",
};

class SessionSocket {
  private client: Client | null = null;
  private listeners = new Map<string, Set<EventCallback<any>>>();
  private reconnectAttempts = 0;
  private options: Required<SocketOptions>;
  private sessionId: string | null = null;
  private token: string | null = null;
  private intentionalDisconnect = false;

  private _status: ConnectionStatus = "idle";

  get status(): ConnectionStatus {
    return this._status;
  }

  constructor(options?: SocketOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  private buildBrokerURL(): string {
    const baseUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";

    if (!process.env.NEXT_PUBLIC_WS_URL) {
      this.log(`NEXT_PUBLIC_WS_URL not defined, using fallback: ${baseUrl}`, "warn");
    }

    // STOMP endpoint: /ws
    return `${baseUrl}/ws`;
  }

  private log(message: string, level: "log" | "warn" | "error" = "log"): void {
    if (!this.options.debug) return;
    const prefix = "[SessionSocket]";
    console[level](`${prefix} ${message}`);
  }

  private emit<T extends SessionEventType>(event: T | "disconnected", data: any): void {
    this.listeners.get(event)?.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        this.log(`Error in event handler for ${event}`, "error");
        console.error(error);
      }
    });
  }

  private setupStompClient(): void {
    if (!this.sessionId || !this.token) {
      this.log("Cannot setup STOMP client: missing sessionId or token", "error");
      return;
    }

    const brokerURL = this.buildBrokerURL();

    this.client = new Client({
      brokerURL,
      connectHeaders: {
        token: this.token,
      },
      debug: (str: string) => {
        if (this.options.debug) {
          console.log("[STOMP]", str);
        }
      },
      // 재연결 비활성화 (커스텀 로직 사용)
      reconnectDelay: 0,

      onConnect: () => {
        this.log("Connected");
        this._status = "connected";
        this.reconnectAttempts = 0;

        // 세션 토픽 구독
        if (this.client && this.sessionId) {
          this.client.subscribe(`/topic/session/${this.sessionId}`, (message: IMessage) => {
            try {
              const event: SessionEvent = JSON.parse(message.body);
              this.log(`Received ${event.type}`);
              this.emit(event.type, event.data);
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : "Unknown error";
              this.log(errorMessage, "error");
              this.log(`Failed to parse message: ${message.body}`, "error");
            }
          });
        }
      },

      onStompError: (frame: IFrame) => {
        this.log(`STOMP error: ${frame.headers["message"]}`, "error");
        this.log(`Details: ${frame.body}`, "error");
        this.emit("error", {
          code: "UNKNOWN",
          message: frame.headers["message"] || "STOMP error occurred",
        });
      },

      onWebSocketClose: () => {
        if (this.intentionalDisconnect) return;

        this.log("WebSocket closed");
        this._status = "disconnected";
        this.emit("disconnected", { code: 1006, reason: "Connection lost" });
        this.tryReconnect();
      },

      onWebSocketError: (event: Event) => {
        this.log("WebSocket error", "error");
        console.error(event);
      },
    });
  }

  private tryReconnect(): void {
    if (
      this.reconnectAttempts >= this.options.maxReconnectAttempts ||
      !this.sessionId ||
      !this.token
    ) {
      this.log("Max reconnect attempts reached or missing credentials");
      return;
    }

    this.reconnectAttempts++;
    this._status = "reconnecting";

    // 지수백오프 알고리즘: 1초 -> 2초 -> 4초 -> 8초 -> 16초 -> 최대 30초
    const exponentialDelay =
      this.options.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
    const delay = Math.min(exponentialDelay, this.options.maxReconnectDelay);
    this.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      if (this.sessionId && this.token) {
        this.connect(this.sessionId, this.token);
      }
    }, delay);
  }

  private cleanup(): void {
    this.intentionalDisconnect = true;

    if (this.client) {
      this.client.deactivate();
    }

    this.client = null;
    this.sessionId = null;
    this.token = null;
    this._status = "idle";
    this.reconnectAttempts = 0;
    this.intentionalDisconnect = false;
    this.removeAllListeners();
  }

  connect(sessionId: string, token: string): void {
    if (this.client?.active) {
      this.log("Already connected");
      return;
    }

    // 기존 클라이언트 정리
    if (this.client) {
      this.intentionalDisconnect = true;
      this.client.deactivate();
      this.intentionalDisconnect = false;
      this.client = null;
    }

    this.sessionId = sessionId;
    this.token = token;
    this._status = "connecting";

    this.log(`Connecting to session: ${sessionId}`);

    this.setupStompClient();

    // setupStompClient()는 sessionId와 token이 있을 때 항상 client를 생성
    this.client!.activate();
  }

  disconnect(): void {
    this.log("Disconnecting");
    this.cleanup();
  }

  send(command: SessionCommand): void {
    if (!this.client?.connected) {
      this.log("Cannot send: STOMP client not connected", "warn");
      return;
    }

    this.log(`Sending: ${command.type}`);

    // destination: /app/{commandType}
    const payload = "data" in command ? command.data : {};
    this.client.publish({
      destination: `/app/${command.type}`,
      body: JSON.stringify(payload),
    });
  }

  on<T extends SessionEventType>(event: T, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(callback);

    return () => this.listeners.get(event)?.delete(callback);
  }

  off<T extends SessionEventType>(event: T, callback?: EventCallback<T>): void {
    if (callback) {
      this.listeners.get(event)?.delete(callback);
    } else {
      this.listeners.delete(event);
    }
  }

  removeAllListeners(): void {
    this.listeners.clear();
  }
}

// 싱글톤 인스턴스
export const sessionSocket = new SessionSocket();

// 새 인스턴스 생성용 (테스트 등)
export function createSessionSocket(options?: SocketOptions): SessionSocket {
  return new SessionSocket(options);
}

// 사용 예시
/**
 * import { sessionSocket } from '@/lib/socket/client';
 *
 * // 1. 연결 전 이벤트 리스너 등록
 * const unsubJoin = sessionSocket.on('participant:join', (participant) => {
 *   console.log('New participant:', participant);
 * });
 *
 * const unsubError = sessionSocket.on('error', (error) => {
 *   console.error('Session error:', error.message);
 * });
 *
 * // 2. 연결
 * sessionSocket.connect(sessionId, token);
 *
 * // 3. 연결 상태 확인
 * console.log(sessionSocket.status); // 'connecting' -> 'connected'
 *
 * // 4. 커맨드 전송
 * sessionSocket.send({ type: 'ready' });
 * sessionSocket.send({ type: 'goal:set', data: { goal: '오늘의 목표' } });
 * sessionSocket.send({ type: 'session:start' }); // 호스트 전용
 *
 * // 5. 연결 해제 시 정리 (컴포넌트 언마운트 시)
 * sessionSocket.disconnect();
 * unsubJoin();
 * unsubError();
 *
 * // React 컴포넌트 예시:
 * useEffect(() => {
 *   const unsubscribes = [
 *     sessionSocket.on('participant:join', handleJoin),
 *     sessionSocket.on('participant:leave', handleLeave),
 *     sessionSocket.on('error', handleError),
 *   ];
 *
 *   sessionSocket.connect(sessionId, token);
 *
 *   return () => {
 *     sessionSocket.disconnect();
 *     unsubscribes.forEach(unsub => unsub());
 *   };
 * }, [sessionId, token]);
 */
