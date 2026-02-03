/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  private ws: WebSocket | null = null;
  private listeners = new Map<string, Set<EventCallback<any>>>();
  private reconnectAttempts = 0;
  private options: Required<SocketOptions>;
  private sessionId: string | null = null;
  private token: string | null = null;

  public status: ConnectionStatus = "idle";

  constructor(options?: SocketOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  private buildUrl(sessionId: string, token: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";

    if (!process.env.NEXT_PUBLIC_WS_URL) {
      this.log(`NEXT_PUBLIC_WS_URL not defined, using fallback: ${baseUrl}`, "warn");
    }

    return `${baseUrl}/session/${sessionId}?token=${token}`; // TODO(장근호): url 수정 가능
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

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.log("Connected");
      this.status = "connected";
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const message: SessionEvent = JSON.parse(event.data);
        this.log(`Received ${message.type}`);
        this.emit(message.type, message.data);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        this.log(errorMessage, "error");
        this.log(`Failed to parse message: ${event.data}`, "error");
      }
    };

    /**
     * 주요 Close Code 예시
      재연결하지 말아야 할 경우:

      1000: 정상 종료 (사용자가 명시적으로 disconnect 호출)
      1008: 정책 위반 (예: 잘못된 메시지 형식)
      4001: 인증 만료 (서버 정의, 재로그인 필요)
      4003: 권한 없음 (서버 정의)
      재연결을 시도해야 할 경우:

      1006: 비정상 종료 (네트워크 끊김)
      1011: 서버 내부 오류
      1001: 서버 재시작 중
      구현 예시
      서버에서 close code를 정의하면, 다음과 같이 분기 처리를 추가할 수 있습니다:

      this.ws.onclose = (event) => {
        this.log(`Disconnected (code: ${event.code}, reason: ${event.reason})`);
        this.status = "disconnected";
        this.emit("disconnected", { code: event.code, reason: event.reason });
        
        // close code에 따라 재연결 여부 결정
        const shouldReconnect = this.shouldReconnect(event.code);
        if (shouldReconnect) {
          this.tryReconnect();
        }
      };

      private shouldReconnect(code: number): boolean {
        // 정상 종료나 명시적 종료는 재연결 안함
        if (code === 1000 || code === 1001) return false;
        
        // 인증/권한 문제는 재연결 안함 (4xxx 커스텀 코드)
        if (code === 4001 || code === 4003) return false;
        
        // 그 외는 재연결 시도
        return true;
      }
     */
    this.ws.onclose = (event) => {
      this.log(`Disconnected (code: ${event.code}, reason: ${event.reason})`);
      this.status = "disconnected";
      this.emit("disconnected", { code: event.code, reason: event.reason });
      this.tryReconnect();
    };
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
    this.status = "reconnecting";

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
    this.ws = null;
    this.sessionId = null;
    this.token = null;
    this.status = "idle";
    this.reconnectAttempts = 0;
    this.removeAllListeners();
  }

  connect(sessionId: string, token: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.log("Already connected");
      return;
    }

    // 기존 WebSocket이 CONNECTING 등 상태로 남아있으면 정리
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }

    this.sessionId = sessionId;
    this.token = token;
    this.status = "connecting";

    const url = this.buildUrl(sessionId, token);
    this.log(`Connecting to ${url}`);

    this.ws = new WebSocket(url);
    this.setupEventHandlers();
  }

  disconnect(): void {
    this.log("Disconnecting");

    if (this.ws) {
      this.ws.onclose = null; // onclose 트리거 방지
      this.ws.close();
    }

    this.cleanup();
  }

  send(command: SessionCommand): void {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      this.log("Cannot send: WebSocket not open", "warn");
      return;
    }

    this.log(`Sending: ${command.type}`);
    this.ws.send(JSON.stringify(command));
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

// 연결
sessionSocket.connect(sessionId, token);

// 이벤트 리스닝
const unsubscribe = sessionSocket.on('participant:join', (participant) => {
  console.log('New participant:', participant);
});

// 커맨드 전송
sessionSocket.send({ type: 'ready' });
sessionSocket.send({ type: 'goal:set', data: { goal: '오늘의 목표' } });

// 연결 해제
sessionSocket.disconnect();

// 리스너 정리
unsubscribe();
 */
