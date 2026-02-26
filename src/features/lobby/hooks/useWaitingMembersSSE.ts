"use client";

import type { SSEError } from "@/lib/sse/types";
import { useSSE } from "@/lib/sse/useSSE";

import type { WaitingMembersEventData } from "../types";

interface UseWaitingMembersSSEOptions {
  sessionId: string;
  enabled?: boolean;
  onError?: (error: SSEError) => void;
}

interface UseWaitingMembersSSEReturn {
  data: WaitingMembersEventData | null;
  status: import("@/lib/sse/types").SSEConnectionStatus;
  error: SSEError | null;
  reconnect: () => void;
  disconnect: () => void;
}

export function useWaitingMembersSSE({
  sessionId,
  enabled = true,
  onError,
}: UseWaitingMembersSSEOptions): UseWaitingMembersSSEReturn {
  return useSSE<WaitingMembersEventData>({
    url: `/api/sse/waiting/${sessionId}`,
    eventName: "waiting-members-updated",
    enabled: enabled && !!sessionId,
    onError,
  });
}
