/**
 * Session Query Hook Factory
 *
 * createCrudHooks를 래핑하여 Session 도메인 전용 훅을 생성합니다.
 * 기본 CRUD(list, detail, create)는 createCrudHooks를 활용하고,
 * 추가 query/mutation(report, join, setGoal, addTodos, toggleTodo)은 별도 구현합니다.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCrudHooks } from "@/hooks/createCrudHooks";
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
  SetGoalRequest,
  SetGoalResponse,
  AddTodosRequest,
  AddTodosResponse,
  ToggleTodoResponse,
} from "../types";
import type { ApiSuccessResponse } from "@/types/shared/types";

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
};

export const useSessionList = sessionCrud.useList;
export const useSessionDetail = sessionCrud.useDetail!;
export const useCreateSession = sessionCrud.useCreate!;
export const prefetchSessionList = sessionCrud.prefetch;

export function useSessionReport(sessionId: string) {
  return useQuery<ApiSuccessResponse<SessionReportResponse>>({
    queryKey: sessionKeys.report(sessionId),
    queryFn: () => sessionApi.getReport(sessionId),
  });
}

export function useJoinSession() {
  const queryClient = useQueryClient();

  return useMutation<
    ApiSuccessResponse<JoinSessionResponse>,
    unknown,
    { sessionRoomId: string; body: JoinSessionRequest }
  >({
    mutationFn: ({ sessionRoomId, body }) => sessionApi.join(sessionRoomId, body),
    onSuccess: (_, { sessionRoomId }) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(sessionRoomId) });
    },
  });
}

export function useSetGoal() {
  const queryClient = useQueryClient();

  return useMutation<
    ApiSuccessResponse<SetGoalResponse>,
    unknown,
    { sessionRoomId: string; body: SetGoalRequest }
  >({
    mutationFn: ({ sessionRoomId, body }) => sessionApi.setGoal(sessionRoomId, body),
    onSuccess: (_, { sessionRoomId }) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(sessionRoomId) });
    },
  });
}

export function useAddTodos() {
  const queryClient = useQueryClient();

  return useMutation<
    ApiSuccessResponse<AddTodosResponse>,
    unknown,
    { sessionRoomId: string; body: AddTodosRequest }
  >({
    mutationFn: ({ sessionRoomId, body }) => sessionApi.addTodos(sessionRoomId, body),
    onSuccess: (_, { sessionRoomId }) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(sessionRoomId) });
    },
  });
}

export function useToggleTodo() {
  const queryClient = useQueryClient();

  return useMutation<
    ApiSuccessResponse<ToggleTodoResponse>,
    unknown,
    { sessionRoomId: string; todoId: string }
  >({
    mutationFn: ({ sessionRoomId, todoId }) => sessionApi.toggleTodo(sessionRoomId, todoId),
    onSuccess: (_, { sessionRoomId }) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(sessionRoomId) });
    },
  });
}
