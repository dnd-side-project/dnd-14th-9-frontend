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
