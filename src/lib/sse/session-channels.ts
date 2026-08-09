/**
 * 세션 관련 SSE 채널 정의.
 *
 * 백엔드가 채널을 통합하면서, 프론트도 채널 단위로 커넥션을 하나만 유지한다.
 * 같은 URL을 구독하는 훅끼리는 공유 SSEClient(`acquireSSEClient`)를 통해
 * 커넥션 1개를 나눠 쓴다.
 */

/**
 * 대기/진행/상태 통합 채널.
 * 백엔드 `GET /sessions/{sessionId}/events/room` 프록시.
 *
 * 기존 3개 채널(waiting-room/events, in-progress/events, status/events)을 통합한 것으로,
 * 이벤트 이름과 payload 포맷은 통합 전과 동일하다.
 */
export function getSessionRoomSSEUrl(sessionId: string): string {
  return `/api/sse/room/${sessionId}`;
}

export const SESSION_ROOM_EVENT = {
  SESSION_STATUS: "session-status-updated",
  WAITING_MEMBERS: "waiting-members-updated",
  IN_PROGRESS_MEMBERS: "in-progress-members-updated",
} as const;

export type SessionRoomEventName = (typeof SESSION_ROOM_EVENT)[keyof typeof SESSION_ROOM_EVENT];

/**
 * 리액션 집계 채널.
 * 백엔드 `GET /sessions/{sessionId}/events/reactions` 프록시.
 *
 * 세션 전체 합계(`total`)와 요청자 본인이 받은 합계(`my`)를 한 이벤트로 내려준다.
 * `my`는 토큰의 memberId로 결정되므로 URL에 memberId를 싣지 않는다.
 */
export function getSessionReactionsSSEUrl(sessionId: string): string {
  return `/api/sse/reactions/${sessionId}`;
}

export const SESSION_REACTION_EVENT = {
  /** 명세상 이벤트 이름 */
  REACTION_SUMMARY: "reaction-summary-updated",
  /** 배포된 백엔드가 실제로 보내는 이름 (2026-08-09 확인) */
  REACTION_UPDATED: "reaction-updated",
} as const;

/**
 * 리액션 집계 채널에서 구독할 이벤트 이름 목록.
 *
 * 명세는 `reaction-summary-updated`인데 배포된 백엔드는 `reaction-updated`로 보내고 있다.
 * payload 포맷(`{ total, my }`)은 양쪽이 동일하므로 두 이름을 모두 구독한다.
 * EventSource는 이름이 일치하는 리스너에만 dispatch하므로, 하나만 구독하면
 * 초기 집계는 물론 리액션 클릭 후 갱신까지 전부 누락된다.
 * 백엔드가 이름을 확정하면 하나로 줄인다.
 */
export const SESSION_REACTION_EVENT_NAMES: string[] = [
  SESSION_REACTION_EVENT.REACTION_SUMMARY,
  SESSION_REACTION_EVENT.REACTION_UPDATED,
];
