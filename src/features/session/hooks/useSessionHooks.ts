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
import type { ApiSuccessResponse } from "@/types/shared/types";

import { sessionApi } from "../api";

import type {
  SessionListParams,
  SessionListResponse,
  SessionDetailResponse,
  SessionReportResponse,
  CreateSessionRequest,
  CreateSessionResponse,
  JoinSessionRequest,
  JoinSessionResponse,
  ToggleTodoResponse,
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

export const useToggleTodo = createSessionMutationHook<
  ApiSuccessResponse<ToggleTodoResponse>,
  { sessionRoomId: string; todoId: string }
>(({ sessionRoomId, todoId }) => sessionApi.toggleTodo(sessionRoomId, todoId));
