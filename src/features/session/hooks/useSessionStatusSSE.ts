"use client";

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
    url: `/api/sse/session-status/${sessionId}`,
    eventName: "session-status-updated",
    enabled: enabled && !!sessionId,
    onData: onStatusChange,
    onError,
  });
}
