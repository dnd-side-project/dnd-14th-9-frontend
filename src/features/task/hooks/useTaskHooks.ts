import { useMutation } from "@tanstack/react-query";

import type { ApiSuccessResponse } from "@/types/shared/types";

import { taskApi, type UpdateGoalRequest, type UpdateTodoRequest } from "../api";

export function useUpdateGoal() {
  return useMutation<ApiSuccessResponse<null>, Error, { taskId: number; body: UpdateGoalRequest }>({
    mutationFn: ({ taskId, body }) => taskApi.updateGoal(taskId, body),
  });
}

export function useUpdateTodo() {
  return useMutation<
    ApiSuccessResponse<null>,
    Error,
    { subtaskId: number; body: UpdateTodoRequest }
  >({
    mutationFn: ({ subtaskId, body }) => taskApi.updateTodo(subtaskId, body),
  });
}

export function useDeleteTodo() {
  return useMutation<ApiSuccessResponse<null>, Error, { subtaskId: number }>({
    mutationFn: ({ subtaskId }) => taskApi.deleteTodo(subtaskId),
  });
}
