import type { WaitingMembersSSEPayload } from "@/features/lobby/types";
import type { InProgressEventData } from "@/features/session/types";

import { getMockInProgress, getMockWaitingRoom } from "./session-state";

export function getMockWaitingMembersSSEPayload(sessionId: number): WaitingMembersSSEPayload {
  return {
    eventType: "ROOM_UPDATE",
    data: getMockWaitingRoom(sessionId),
  };
}

export function getMockInProgressMembersSSEPayload(sessionId: number): InProgressEventData {
  return getMockInProgress(sessionId);
}
