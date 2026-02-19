// SSE 연결 상태
export type SSEConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected";

// SSE 클라이언트 옵션
export interface SSEClientOptions {
  maxReconnectAttempts?: number;
  reconnectInterval?: number;
  maxReconnectDelay?: number;
  debug?: boolean;
}

// SSE 에러 코드
export type SSEErrorCode =
  | "CONNECTION_FAILED"
  | "PARSE_ERROR"
  | "AUTH_ERROR"
  | "MAX_RECONNECT_REACHED"
  | "UNKNOWN";

// SSE 에러
export interface SSEError {
  code: SSEErrorCode;
  message: string;
}

// 이벤트 콜백 타입
export type SSEEventCallback<T> = (data: T) => void;
