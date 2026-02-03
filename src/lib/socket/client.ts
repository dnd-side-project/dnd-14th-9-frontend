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
}
