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

// 이벤트 전달 메타
export interface SSEEventDelivery {
  /** 실시간 수신이 아니라 캐시된 마지막 payload를 재생한 호출인지 여부 */
  replayed: boolean;
}

// 이벤트 콜백 타입
export type SSEEventCallback<T> = (data: T, delivery: SSEEventDelivery) => void;

// 이벤트 구독 옵션
export interface SSESubscribeOptions {
  /**
   * 구독 시점에 이미 수신해 둔 마지막 payload가 있으면 즉시 1회 재생할지 여부.
   * 공유 커넥션에 늦게 합류해 초기 이벤트를 놓친 구독자를 위한 옵션.
   */
  replayLast?: boolean;
}
