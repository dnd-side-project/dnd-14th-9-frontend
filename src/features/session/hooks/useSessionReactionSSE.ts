"use client";

import type { SSEError } from "@/lib/sse/types";
import { useSSE } from "@/lib/sse/useSSE";

import type { SessionReactionEventData } from "../types";

interface UseSessionReactionSSEOptions {
  sessionId: string;
  enabled?: boolean;
  onError?: (error: SSEError) => void;
}

interface UseSessionReactionSSEReturn {
  data: SessionReactionEventData | null;
  status: import("@/lib/sse/types").SSEConnectionStatus;
  error: SSEError | null;
  reconnect: () => void;
  disconnect: () => void;
}

export function useSessionReactionSSE({
  sessionId,
  enabled = true,
  onError,
}: UseSessionReactionSSEOptions): UseSessionReactionSSEReturn {
  return useSSE<SessionReactionEventData>({
    url: `/api/sse/reaction/${sessionId}`,
    eventName: "reaction-updated",
    enabled: enabled && !!sessionId,
    onError,
  });
}
