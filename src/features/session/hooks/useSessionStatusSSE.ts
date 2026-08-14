"use client";

import { getSessionRoomSSEUrl, SESSION_ROOM_EVENT } from "@/lib/sse/session-channels";
import type { SSEError } from "@/lib/sse/types";
import { useSSE } from "@/lib/sse/useSSE";

import type { SessionStatusEventData } from "../types";

interface UseSessionStatusSSEOptions {
  sessionId: string;
  enabled?: boolean;
  onStatusChange?: (status: SessionStatusEventData) => void;
  onError?: (error: SSEError) => void;
}

interface UseSessionStatusSSEReturn {
  data: SessionStatusEventData | null;
  status: import("@/lib/sse/types").SSEConnectionStatus;
  error: SSEError | null;
  reconnect: () => void;
  disconnect: () => void;
}

export function useSessionStatusSSE({
  sessionId,
  enabled = true,
  onStatusChange,
  onError,
}: UseSessionStatusSSEOptions): UseSessionStatusSSEReturn {
  return useSSE<SessionStatusEventData>({
    url: getSessionRoomSSEUrl(sessionId),
    eventName: SESSION_ROOM_EVENT.SESSION_STATUS,
    enabled: enabled && !!sessionId,
    // 상태는 최신 값만 의미가 있으므로 늦게 합류해도 마지막 상태를 재생받는다.
    replayLastEvent: true,
    onData: onStatusChange,
    onError,
  });
}
