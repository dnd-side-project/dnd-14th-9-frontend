"use client";

import { getSessionRoomSSEUrl, SESSION_ROOM_EVENT } from "@/lib/sse/session-room";
import type { SSEError } from "@/lib/sse/types";
import { useSSE } from "@/lib/sse/useSSE";

import type { InProgressEventData } from "../types";

interface UseInProgressMembersSSEOptions {
  sessionId: string;
  enabled?: boolean;
  onError?: (error: SSEError) => void;
}

interface UseInProgressMembersSSEReturn {
  data: InProgressEventData | null;
  status: import("@/lib/sse/types").SSEConnectionStatus;
  error: SSEError | null;
  reconnect: () => void;
  disconnect: () => void;
}

export function useInProgressMembersSSE({
  sessionId,
  enabled = true,
  onError,
}: UseInProgressMembersSSEOptions): UseInProgressMembersSSEReturn {
  return useSSE<InProgressEventData>({
    url: getSessionRoomSSEUrl(sessionId),
    eventName: SESSION_ROOM_EVENT.IN_PROGRESS_MEMBERS,
    enabled: enabled && !!sessionId,
    // 참여자 목록은 전체 스냅샷이므로 늦게 합류해도 마지막 목록을 재생받는다.
    replayLastEvent: true,
    onError,
  });
}
