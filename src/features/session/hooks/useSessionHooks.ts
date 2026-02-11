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

export const useSetGoal = createSessionMutationHook<
  ApiSuccessResponse<SetGoalResponse>,
  { sessionRoomId: string; body: SetGoalRequest }
>(({ sessionRoomId, body }) => sessionApi.setGoal(sessionRoomId, body));

export const useAddTodos = createSessionMutationHook<
  ApiSuccessResponse<AddTodosResponse>,
  { sessionRoomId: string; body: AddTodosRequest }
>(({ sessionRoomId, body }) => sessionApi.addTodos(sessionRoomId, body));

export const useToggleTodo = createSessionMutationHook<
  ApiSuccessResponse<ToggleTodoResponse>,
  { sessionRoomId: string; todoId: string }
>(({ sessionRoomId, todoId }) => sessionApi.toggleTodo(sessionRoomId, todoId));
