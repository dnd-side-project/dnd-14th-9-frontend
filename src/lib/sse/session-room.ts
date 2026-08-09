/**
 * 세션 대기/진행/상태 통합 SSE 채널.
 *
 * 백엔드가 기존 3개 채널(waiting-room/events, in-progress/events, status/events)을
 * `GET /sessions/{sessionId}/events/room` 하나로 통합했습니다.
 * 이벤트 이름과 payload 포맷은 통합 전과 동일합니다.
 *
 * 프론트에서는 이 URL을 공유 SSEClient(`acquireSSEClient`)로 구독하므로,
 * 한 페이지에서 여러 훅이 서로 다른 이벤트를 구독해도 커넥션은 1개만 유지됩니다.
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
