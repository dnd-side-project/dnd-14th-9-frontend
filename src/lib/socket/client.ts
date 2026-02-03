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
  debug?: boolean;
}

const DEFAULT_OPTIONS: Required<SocketOptions> = {
  maxReconnectAttempts: 5,
  reconnectInterval: 1000,
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
    const baseUrl = process.env.NEXT_PUBLIC_WS_URL;
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

    const delay = this.options.reconnectInterval * this.reconnectAttempts;
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

  removeAllListeners(): void {
    this.listeners.clear();
  }

  connect(sessionId: string, token: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.log("Already connected");
      return;
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
    this.reconnectAttempts = this.options.maxReconnectAttempts; // 재연결 방지
    this.ws?.close();
    this.cleanup();
  }
}
