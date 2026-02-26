"use client";

import type { SSEError } from "@/lib/sse/types";
import { useSSE } from "@/lib/sse/useSSE";

import type { MemberReactionEventData } from "../types";

interface UseMemberReactionSSEOptions {
  sessionId: string;
  memberId: string;
  enabled?: boolean;
  onError?: (error: SSEError) => void;
}

interface UseMemberReactionSSEReturn {
  data: MemberReactionEventData | null;
  status: import("@/lib/sse/types").SSEConnectionStatus;
  error: SSEError | null;
  reconnect: () => void;
  disconnect: () => void;
}

export function useMemberReactionSSE({
  sessionId,
  memberId,
  enabled = true,
  onError,
}: UseMemberReactionSSEOptions): UseMemberReactionSSEReturn {
  return useSSE<MemberReactionEventData>({
    url: `/api/sse/reaction/${sessionId}/members/${memberId}`,
    eventName: "member-reaction-updated",
    enabled: enabled && !!sessionId && !!memberId,
    onError,
  });
}
