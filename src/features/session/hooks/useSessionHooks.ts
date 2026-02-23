/**
 * Session Query Hook Factory
 *
 * createCrudHooks를 래핑하여 Session 도메인 전용 훅을 생성합니다.
 * 기본 CRUD(list, detail, create)는 createCrudHooks를 활용하고,
 * 추가 query/mutation(report, join, setGoal, addTodos, toggleTodo)은 별도 구현합니다.
 */

import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";

import { createCrudHooks } from "@/hooks/createCrudHooks";
import { ApiError } from "@/lib/api/api-client";
import type { SSEConnectionStatus, SSEError } from "@/lib/sse/types";
import type { ApiSuccessResponse } from "@/types/shared/types";

import { sessionApi } from "../api";

import { useInProgressMembersSSE } from "./useInProgressMembersSSE";

import type {
  InProgressEventData,
  SessionListParams,
  SessionListResponse,
  SessionDetailResponse,
  SessionReportResponse,
  CreateSessionRequest,
  CreateSessionResponse,
  JoinSessionRequest,
  JoinSessionResponse,
  WaitingRoomResponse,
} from "../types";

const sessionCrud = createCrudHooks<
  SessionListParams,
  ApiSuccessResponse<SessionListResponse>,
  ApiSuccessResponse<SessionDetailResponse>,
  CreateSessionRequest,
  never, // update 없음
  CreateSessionResponse
>({
  queryKey: "session",
  getList: sessionApi.getList,
  getDetail: sessionApi.getDetail,
  create: sessionApi.createSession,
});

export const sessionKeys = {
  ...sessionCrud.keys,
  report: (id: string) => ["session", "report", id] as const,
  waitingRoom: (id: string) => ["session", "waitingRoom", id] as const,
  inProgress: (id: string) => ["session", "inProgress", id] as const,
};

export const useSessionList = sessionCrud.useList;
export function useSuspenseSessionList(params: SessionListParams) {
  return useSuspenseQuery({
    queryKey: sessionKeys.list(params),
    queryFn: () => sessionApi.getList(params),
  });
}
export const useSessionDetail = sessionCrud.useDetail!;
/**
 * 세션 생성 mutation 훅
 *
 * CRUD 팩토리의 useCreate는 단일 인자만 전달하여 image 파라미터가 누락되므로,
 * body와 image를 함께 전달할 수 있도록 커스텀 mutation으로 구현합니다.
 */
export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation<
    ApiSuccessResponse<CreateSessionResponse>,
    ApiError,
    { body: CreateSessionRequest; image?: File }
  >({
    mutationFn: ({ body, image }) => sessionApi.createSession(body, image),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
    },
  });
}
export const prefetchSessionList = sessionCrud.prefetch;

export function useSessionReport(sessionId: string) {
  return useQuery<ApiSuccessResponse<SessionReportResponse>>({
    queryKey: sessionKeys.report(sessionId),
    queryFn: () => sessionApi.getReport(sessionId),
  });
}

interface UseWaitingRoomOptions {
  enabled?: boolean;
}

export function useWaitingRoom(sessionId: string, options?: UseWaitingRoomOptions) {
  return useQuery<ApiSuccessResponse<WaitingRoomResponse>>({
    queryKey: sessionKeys.waitingRoom(sessionId),
    queryFn: () => sessionApi.getWaitingRoom(sessionId),
    enabled: options?.enabled ?? true,
  });
}

const createSessionMutationHook = <TData, TVariables extends { sessionRoomId: string }>(
  mutationFn: (vars: TVariables) => Promise<TData>
) => {
  return () => {
    const queryClient = useQueryClient();
    return useMutation<TData, unknown, TVariables>({
      mutationFn,
      onSuccess: (_, { sessionRoomId }) => {
        queryClient.invalidateQueries({ queryKey: sessionKeys.detail(sessionRoomId) });
      },
    });
  };
};

export const useJoinSession = createSessionMutationHook<
  ApiSuccessResponse<JoinSessionResponse>,
  { sessionRoomId: string; body: JoinSessionRequest }
>(({ sessionRoomId, body }) => sessionApi.join(sessionRoomId, body));

export function useLeaveSession() {
  const queryClient = useQueryClient();
  return useMutation<ApiSuccessResponse<null>, ApiError, { sessionRoomId: string }>({
    mutationFn: ({ sessionRoomId }) => sessionApi.leave(sessionRoomId),
    onSuccess: (_, { sessionRoomId }) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sessionKeys.inProgress(sessionRoomId) });
      queryClient.invalidateQueries({ queryKey: sessionKeys.waitingRoom(sessionRoomId) });
    },
  });
}

export function useKickMembers() {
  const queryClient = useQueryClient();
  return useMutation<
    ApiSuccessResponse<null>,
    ApiError,
    { sessionId: string; memberIds: number[] }
  >({
    mutationFn: ({ sessionId, memberIds }) => sessionApi.kickMembers(sessionId, memberIds),
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.waitingRoom(sessionId) });
    },
  });
}

// ============================================
// In-Progress (REST + SSE)
// ============================================

interface UseInProgressOptions {
  sessionId: string;
  enabled?: boolean;
}

export function useInProgress({ sessionId, enabled = true }: UseInProgressOptions) {
  return useQuery<ApiSuccessResponse<InProgressEventData>>({
    queryKey: sessionKeys.inProgress(sessionId),
    queryFn: () => sessionApi.getInProgress(sessionId),
    enabled: enabled && !!sessionId,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

interface UseInProgressDataOptions {
  sessionId: string;
  enabled?: boolean;
  onSSEError?: (error: SSEError) => void;
}

interface UseInProgressDataReturn {
  data: InProgressEventData | null;
  isLoading: boolean;
  sseStatus: SSEConnectionStatus;
  sseError: SSEError | null;
  reconnect: () => void;
  disconnect: () => void;
}

/**
 * 세션 진행 중 참여자 데이터 통합 훅
 *
 * 초기 진입 시 HTTP API로 데이터를 가져오고,
 * 이후에는 SSE로 실시간 업데이트를 받습니다.
 */
export function useInProgressData({
  sessionId,
  enabled = true,
  onSSEError,
}: UseInProgressDataOptions): UseInProgressDataReturn {
  const { data: initialData, isLoading } = useInProgress({ sessionId, enabled });

  const {
    data: sseData,
    status: sseStatus,
    error: sseError,
    reconnect,
    disconnect,
  } = useInProgressMembersSSE({
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

export function useToggleSubtaskCompletion() {
  return useMutation<ApiSuccessResponse<null>, ApiError, { subtaskId: number }>({
    mutationFn: ({ subtaskId }) => sessionApi.toggleSubtaskCompletion(subtaskId),
  });
}
