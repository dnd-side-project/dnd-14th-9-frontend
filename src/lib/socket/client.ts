/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client, type IFrame, type IMessage } from "@stomp/stompjs";

import type { ChatError, ChatReceivedMessage, ChatSendPayload, ConnectionStatus } from "./types";

type ChatEventMap = {
  message: ChatReceivedMessage;
  error: ChatError;
  status: ConnectionStatus;
};

type ChatEventCallback<T extends keyof ChatEventMap> = (data: ChatEventMap[T]) => void;

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

class ChatSocket {
  private client: Client | null = null;
  private listeners = new Map<keyof ChatEventMap, Set<ChatEventCallback<any>>>();
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
    const prefix = "[ChatSocket]";
    console[level](`${prefix} ${message}`);
  }

  private setStatus(status: ConnectionStatus): void {
    this._status = status;
    this.emit("status", status);
  }

  private emit<T extends keyof ChatEventMap>(event: T, data: ChatEventMap[T]): void {
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
        Authorization: `Bearer ${this.token}`,
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
        this.setStatus("connected");
        this.reconnectAttempts = 0;

        if (!this.client || !this.sessionId) return;

        // 채팅 메시지 구독
        this.client.subscribe(`/sub/chat/${this.sessionId}`, (message: IMessage) => {
          try {
            const chatMessage: ChatReceivedMessage = JSON.parse(message.body);
            this.log(`Received message from ${chatMessage.memberId}`);
            this.emit("message", chatMessage);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            this.log(errorMessage, "error");
            this.log(`Failed to parse message: ${message.body}`, "error");
          }
        });

        // 채팅 에러 구독
        this.client.subscribe(`/user/queue/chat/error`, (message: IMessage) => {
          try {
            const chatError: ChatError = JSON.parse(message.body);
            this.log(`Received error: ${chatError.code}`, "error");
            this.emit("error", chatError);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            this.log(errorMessage, "error");
            this.log(`Failed to parse error message: ${message.body}`, "error");
          }
        });
      },

      onStompError: (frame: IFrame) => {
        this.log(`STOMP error: ${frame.headers["message"]}`, "error");
        this.log(`Details: ${frame.body}`, "error");
        // STOMP CONNECT 거부(토큰 없음/만료 등)는 연결 실패이지 /user/queue/chat/error
        // 계약(CHAT400/SESSION400_5/SESSION403_01)에 속하지 않으므로 error 이벤트로
        // 위조해 emit하지 않고, 연결 실패로 취급해 재연결 로직을 태운다.
        this.setStatus("disconnected");
        this.discardClient();
        this.tryReconnect();
      },

      onWebSocketClose: () => {
        if (this.intentionalDisconnect) return;

        this.log("WebSocket closed");
        this.setStatus("disconnected");
        this.discardClient();
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
    this.setStatus("reconnecting");

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

  // stomp.js의 client.active는 activate() 이후 deactivate()를 호출하기 전까지 true로
  // 유지된다 — 네트워크가 끊겨 onWebSocketClose/onStompError가 발생해도 자동으로
  // false가 되지 않는다. 그대로 두면 connect()의 "이미 활성 연결"(active) 가드가
  // 재연결 시도를 막아버리므로, 재연결 전에 반드시 기존 client를 명시적으로
  // 정리(deactivate + null)해야 한다.
  private discardClient(): void {
    if (!this.client) return;

    this.intentionalDisconnect = true;
    this.client.deactivate();
    this.intentionalDisconnect = false;
    this.client = null;
  }

  private cleanup(): void {
    this.intentionalDisconnect = true;

    if (this.client) {
      this.client.deactivate();
    }

    this.client = null;
    this.sessionId = null;
    this.token = null;
    this.reconnectAttempts = 0;
    this.intentionalDisconnect = false;
    this.removeAllListeners();
    this.setStatus("idle");
  }

  connect(sessionId: string, token: string): void {
    if (this.client?.active) {
      this.log("Already connected");
      return;
    }

    // 기존 클라이언트 정리
    this.discardClient();

    this.sessionId = sessionId;
    this.token = token;
    this.setStatus("connecting");

    this.log(`Connecting to session: ${sessionId}`);

    this.setupStompClient();

    // setupStompClient()는 sessionId와 token이 있을 때 항상 client를 생성
    this.client!.activate();
  }

  disconnect(): void {
    this.log("Disconnecting");
    this.cleanup();
  }

  send(payload: ChatSendPayload): void {
    if (!this.client?.connected || !this.sessionId) {
      this.log("Cannot send: STOMP client not connected", "warn");
      return;
    }

    this.log(`Sending: ${payload.type}`);

    this.client.publish({
      destination: `/pub/chat/${this.sessionId}`,
      body: JSON.stringify(payload),
    });
  }

  on<T extends keyof ChatEventMap>(event: T, callback: ChatEventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(callback);

    return () => this.listeners.get(event)?.delete(callback);
  }

  off<T extends keyof ChatEventMap>(event: T, callback?: ChatEventCallback<T>): void {
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

// 채팅 다이얼로그 마운트마다 새 인스턴스를 만들어 쓴다 (컴포넌트 언마운트 시 disconnect)
export function createChatSocket(options?: SocketOptions): ChatSocket {
  return new ChatSocket(options);
}

export type { ChatSocket };

// 사용 예시
/**
 * import { createChatSocket } from '@/lib/socket/client';
 *
 * const chatSocket = createChatSocket();
 *
 * // 1. 연결 전 이벤트 리스너 등록
 * const unsubMessage = chatSocket.on('message', (message) => {
 *   console.log('New chat message:', message);
 * });
 *
 * const unsubError = chatSocket.on('error', (error) => {
 *   console.error('Chat error:', error.message);
 * });
 *
 * // 2. 연결
 * chatSocket.connect(sessionId, accessToken);
 *
 * // 3. 연결 상태 확인
 * console.log(chatSocket.status); // 'connecting' -> 'connected'
 *
 * // 4. 메시지 전송 (호스트 전용, 참여자가 보내면 서버가 드롭/에러 응답)
 * chatSocket.send({ type: 'TEXT', content: '모두 집중해주세요!' });
 * chatSocket.send({ type: 'QUICK_ACTION', quickActionType: 'LIKE' });
 *
 * // 5. 연결 해제 시 정리 (컴포넌트 언마운트 시)
 * chatSocket.disconnect();
 * unsubMessage();
 * unsubError();
 *
 * // React 컴포넌트 예시:
 * useEffect(() => {
 *   const unsubscribes = [
 *     chatSocket.on('message', handleMessage),
 *     chatSocket.on('error', handleError),
 *   ];
 *
 *   chatSocket.connect(sessionId, accessToken);
 *
 *   return () => {
 *     chatSocket.disconnect();
 *     unsubscribes.forEach(unsub => unsub());
 *   };
 * }, [sessionId, accessToken]);
 */
