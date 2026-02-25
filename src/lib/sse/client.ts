/* eslint-disable no-console */
import type {
  SSEConnectionStatus,
  SSEClientOptions,
  SSEEventCallback,
  SSEError,
  SSEErrorCode,
} from "./types";

const DEFAULT_OPTIONS: Required<SSEClientOptions> = {
  maxReconnectAttempts: 5,
  reconnectInterval: 1000,
  maxReconnectDelay: 30000, // 최대 30초
  debug: process.env.NODE_ENV === "development",
};

export class SSEClient<TEventType extends string = string> {
  private eventSource: EventSource | null = null;
  private listeners = new Map<string, Set<SSEEventCallback<unknown>>>();
  private statusListeners = new Set<(status: SSEConnectionStatus) => void>();
  private registeredEvents = new Set<string>(); // EventSource에 등록된 이벤트 타입 추적
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private stableConnectionTimer: ReturnType<typeof setTimeout> | null = null;
  private options: Required<SSEClientOptions>;
  private url: string | null = null;
  private intentionalDisconnect = false;

  private _status: SSEConnectionStatus = "idle";

  get status(): SSEConnectionStatus {
    return this._status;
  }

  constructor(options?: SSEClientOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  private log(message: string, level: "log" | "warn" | "error" = "log"): void {
    if (!this.options.debug) return;
    const prefix = "[SSEClient]";
    console[level](`${prefix} ${message}`);
  }

  private setStatus(status: SSEConnectionStatus): void {
    this._status = status;
    this.statusListeners.forEach((callback) => {
      try {
        callback(status);
      } catch (error) {
        this.log("Error in status callback", "error");
        console.error(error);
      }
    });
  }

  private emit<T>(event: string, data: T): void {
    this.listeners.get(event)?.forEach((callback) => {
      try {
        (callback as SSEEventCallback<T>)(data);
      } catch (error) {
        this.log(`Error in event handler for ${event}`, "error");
        console.error(error);
      }
    });
  }

  private clearStableConnectionTimer(): void {
    if (this.stableConnectionTimer) {
      clearTimeout(this.stableConnectionTimer);
      this.stableConnectionTimer = null;
    }
  }

  private emitError(code: SSEErrorCode, message: string): void {
    const error: SSEError = { code, message };
    this.emit("error", error);
  }

  private setupEventSource(): void {
    if (!this.url) {
      this.log("Cannot setup EventSource: missing URL", "error");
      return;
    }

    this.eventSource = new EventSource(this.url, { withCredentials: true });
    this.registeredEvents.clear(); // 새 EventSource 생성 시 등록 이벤트 초기화

    this.eventSource.onopen = () => {
      this.log("Connected");
      this.setStatus("connected");

      // 연결이 안정적으로 유지된 후에만 재연결 카운터를 리셋한다.
      // 즉시 리셋하면 연결 직후 끊기는 경우 무한 재연결 루프에 빠진다.
      this.clearStableConnectionTimer();
      this.stableConnectionTimer = setTimeout(() => {
        this.reconnectAttempts = 0;
      }, 3000);
    };

    this.eventSource.onerror = () => {
      if (this.intentionalDisconnect) return;

      this.clearStableConnectionTimer();
      this.log("Connection error", "error");
      this.eventSource?.close();
      this.setStatus("disconnected");
      this.emitError("CONNECTION_FAILED", "SSE connection failed");
      this.tryReconnect();
    };

    // 기본 메시지 핸들러 (이름 없는 이벤트용)
    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.log(`Received message: ${JSON.stringify(data)}`);
        this.emit("message", data);
      } catch {
        this.log(`Failed to parse message: ${event.data}`, "error");
        this.emitError("PARSE_ERROR", "Failed to parse SSE message");
      }
    };
  }

  private tryReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      this.log("Max reconnect attempts reached");
      this.emitError("MAX_RECONNECT_REACHED", "Maximum reconnection attempts reached");
      return;
    }

    if (!this.url) {
      this.log("Cannot reconnect: no URL stored", "error");
      return;
    }

    this.reconnectAttempts++;
    this.setStatus("reconnecting");

    // 지수 백오프 + jitter: thundering herd 방지
    const exponentialDelay =
      this.options.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
    const jitter = 0.75 + Math.random() * 0.5; // 0.75 ~ 1.25 범위
    const delay = Math.min(exponentialDelay * jitter, this.options.maxReconnectDelay);
    this.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      if (this.url) {
        this.setupEventSource();
        this.reattachEventListeners();
      }
    }, delay);
  }

  private registerEventOnSource(eventName: string): void {
    if (!this.eventSource) return;
    if (this.registeredEvents.has(eventName)) return; // 이미 등록된 이벤트는 스킵

    this.eventSource.addEventListener(eventName, (event: Event) => {
      const messageEvent = event as MessageEvent;
      try {
        const data = JSON.parse(messageEvent.data);
        this.log(`Received ${eventName}: ${JSON.stringify(data)}`);
        this.emit(eventName, data);
      } catch {
        this.log(`Failed to parse ${eventName} event: ${messageEvent.data}`, "error");
        this.emitError("PARSE_ERROR", `Failed to parse ${eventName} event`);
      }
    });

    this.registeredEvents.add(eventName);
  }

  private reattachEventListeners(): void {
    if (!this.eventSource) return;

    // 등록된 모든 named event 리스너를 EventSource에 다시 연결
    this.listeners.forEach((_, eventName) => {
      if (eventName === "error" || eventName === "message") return;
      this.registerEventOnSource(eventName);
    });
  }

  connect(url: string): void {
    if (
      this.eventSource?.readyState === EventSource.OPEN ||
      this.eventSource?.readyState === EventSource.CONNECTING
    ) {
      this.log("Already connected or connecting");
      return;
    }

    // 기존 연결 정리
    if (this.eventSource) {
      this.intentionalDisconnect = true;
      this.eventSource.close();
      this.intentionalDisconnect = false;
      this.eventSource = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.clearStableConnectionTimer();

    this.url = url;
    this.reconnectAttempts = 0;
    this.setStatus("connecting");
    this.log(`Connecting to: ${this.url}`);

    this.setupEventSource();
    this.reattachEventListeners();
  }

  disconnect(): void {
    this.log("Disconnecting");
    this.intentionalDisconnect = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.clearStableConnectionTimer();

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.url = null;
    this.setStatus("idle");
    this.reconnectAttempts = 0;
    this.intentionalDisconnect = false;
  }

  on<T>(eventName: TEventType | "error" | "message", callback: SSEEventCallback<T>): () => void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }

    this.listeners.get(eventName)!.add(callback as SSEEventCallback<unknown>);

    // 이미 연결된 상태라면 EventSource에 리스너 등록 (중복 등록 방지)
    if (this.eventSource && eventName !== "error" && eventName !== "message") {
      this.registerEventOnSource(eventName);
    }

    return () => this.listeners.get(eventName)?.delete(callback as SSEEventCallback<unknown>);
  }

  off(eventName: TEventType | "error" | "message", callback?: SSEEventCallback<unknown>): void {
    if (callback) {
      this.listeners.get(eventName)?.delete(callback);
      // 해당 이벤트의 리스너가 모두 제거되면 정리
      if (this.listeners.get(eventName)?.size === 0) {
        this.listeners.delete(eventName);
        this.registeredEvents.delete(eventName);
      }
    } else {
      this.listeners.delete(eventName);
      this.registeredEvents.delete(eventName);
    }
  }

  onStatusChange(callback: (status: SSEConnectionStatus) => void): () => void {
    this.statusListeners.add(callback);
    return () => this.statusListeners.delete(callback);
  }

  removeAllListeners(): void {
    this.listeners.clear();
    this.statusListeners.clear();
    this.registeredEvents.clear();
  }
}

// 팩토리 함수
export function createSSEClient<TEventType extends string = string>(
  options?: SSEClientOptions
): SSEClient<TEventType> {
  return new SSEClient<TEventType>(options);
}
