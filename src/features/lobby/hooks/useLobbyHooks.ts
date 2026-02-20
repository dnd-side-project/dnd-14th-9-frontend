"use client";

import { useQuery } from "@tanstack/react-query";

import type { SSEConnectionStatus, SSEError } from "@/lib/sse/types";
import type { ApiSuccessResponse } from "@/types/shared/types";

import { lobbyApi } from "../api";

import { useWaitingMembersSSE } from "./useWaitingMembersSSE";

import type { WaitingMembersEventData } from "../types";

export const lobbyKeys = {
  all: ["lobby"] as const,
  waitingMembers: (sessionId: string) => ["lobby", "waitingMembers", sessionId] as const,
};

interface UseWaitingMembersOptions {
  sessionId: string;
  enabled?: boolean;
}

/**
 * 대기방 참여자 목록을 HTTP API로 조회하는 훅
 * 초기 진입 시 한 번 호출하여 참여자 목록을 가져옵니다.
 */
export function useWaitingMembers({ sessionId, enabled = true }: UseWaitingMembersOptions) {
  return useQuery<ApiSuccessResponse<WaitingMembersEventData>>({
    queryKey: lobbyKeys.waitingMembers(sessionId),
    queryFn: () => lobbyApi.getWaitingMembers(sessionId),
    enabled: enabled && !!sessionId,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

interface UseWaitingRoomDataOptions {
  sessionId: string;
  enabled?: boolean;
  onSSEError?: (error: SSEError) => void;
}

interface UseWaitingRoomDataReturn {
  data: WaitingMembersEventData | null;
  isLoading: boolean;
  sseStatus: SSEConnectionStatus;
  sseError: SSEError | null;
  reconnect: () => void;
  disconnect: () => void;
}

/**
 * 대기방 참여자 데이터 통합 훅
 *
 * 초기 진입 시 HTTP API로 데이터를 가져오고,
 * 이후에는 SSE로 실시간 업데이트를 받습니다.
 *
 * @example
 * ```tsx
 * function WaitingRoom({ sessionId }: { sessionId: string }) {
 *   const { data, isLoading, sseStatus } = useWaitingRoomData({ sessionId });
 *
 *   if (isLoading) return <Loading />;
 *
 *   return (
 *     <ul>
 *       {data?.members.map((member) => (
 *         <li key={member.memberId}>{member.nickname}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useWaitingRoomData({
  sessionId,
  enabled = true,
  onSSEError,
}: UseWaitingRoomDataOptions): UseWaitingRoomDataReturn {
  const { data: initialData, isLoading } = useWaitingMembers({ sessionId, enabled });

  const {
    data: sseData,
    status: sseStatus,
    error: sseError,
    reconnect,
    disconnect,
  } = useWaitingMembersSSE({
    sessionId,
    enabled,
    onError: onSSEError,
  });

  // SSE 데이터 우선, 없으면 초기 HTTP 응답 사용
  const data = sseData ?? initialData?.result ?? null;

  // HTTP 로딩 중이면서 SSE 데이터도 아직 없는 경우에만 로딩 표시
  const isInitialLoading = isLoading && !sseData;

  return {
    data,
    isLoading: isInitialLoading,
    sseStatus,
    sseError,
    reconnect,
    disconnect,
  };
}
