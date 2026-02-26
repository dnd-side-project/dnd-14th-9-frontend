"use client";

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
    url: `/api/sse/in-progress/${sessionId}`,
    eventName: "in-progress-members-updated",
    enabled: enabled && !!sessionId,
    onError,
  });
}
