import type { WaitingMembersSSEPayload } from "@/features/lobby/types";
import type { InProgressEventData, SessionStatusEventData } from "@/features/session/types";

import { getMockInProgress, getMockSessionStatus, getMockWaitingRoom } from "./session-state";

export function getMockWaitingMembersSSEPayload(sessionId: number): WaitingMembersSSEPayload {
  return {
    eventType: "ROOM_UPDATE",
    data: getMockWaitingRoom(sessionId),
  };
}

export function getMockInProgressMembersSSEPayload(sessionId: number): InProgressEventData {
  return getMockInProgress(sessionId);
}

export interface MockSSEEvent {
  event: string;
  data: unknown;
}

/**
 * 통합 room 채널의 구독 직후 초기 전송을 재현한다.
 *
 * 실서버와 동일하게 session-status-updated를 먼저 보내고,
 * 세션 상태에 따라 waiting/in-progress 참여자 이벤트 중 하나만 이어서 보낸다.
 */
export function getMockSessionRoomSSEEvents(sessionId: number): MockSSEEvent[] {
  const status = getMockSessionStatus(sessionId);
  const statusEvent: SessionStatusEventData = { status };

  return [
    { event: "session-status-updated", data: statusEvent },
    status === "WAITING"
      ? {
          event: "waiting-members-updated",
          data: getMockWaitingMembersSSEPayload(sessionId),
        }
      : {
          event: "in-progress-members-updated",
          data: getMockInProgressMembersSSEPayload(sessionId),
        },
  ];
}
