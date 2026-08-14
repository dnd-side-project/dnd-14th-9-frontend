"use client";

import {
  getSessionReactionsSSEUrl,
  SESSION_REACTION_EVENT_NAMES,
} from "@/lib/sse/session-channels";
import type { SSEConnectionStatus, SSEError } from "@/lib/sse/types";
import { useSSE } from "@/lib/sse/useSSE";

import type { ReactionSummaryEventData } from "../types";

interface UseReactionSummarySSEOptions {
  sessionId: string;
  enabled?: boolean;
  onError?: (error: SSEError) => void;
}

interface UseReactionSummarySSEReturn {
  data: ReactionSummaryEventData | null;
  status: SSEConnectionStatus;
  error: SSEError | null;
  reconnect: () => void;
  disconnect: () => void;
}

/**
 * 세션 리액션 집계 SSE 훅.
 *
 * 세션 전체 합계(`total`)와 본인이 받은 합계(`my`)를 한 커넥션으로 받는다.
 * `my`는 토큰의 memberId 기준이므로 별도 인자가 필요 없다.
 */
export function useReactionSummarySSE({
  sessionId,
  enabled = true,
  onError,
}: UseReactionSummarySSEOptions): UseReactionSummarySSEReturn {
  return useSSE<ReactionSummaryEventData>({
    url: getSessionReactionsSSEUrl(sessionId),
    eventName: SESSION_REACTION_EVENT_NAMES,
    enabled: enabled && !!sessionId,
    // 집계는 최신 값만 의미가 있으므로 늦게 합류해도 마지막 집계를 재생받는다.
    replayLastEvent: true,
    onError,
  });
}
