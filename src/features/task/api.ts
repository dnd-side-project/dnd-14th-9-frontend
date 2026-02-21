import { api } from "@/lib/api/api";
import type { ApiSuccessResponse } from "@/types/shared/types";

export interface UpdateGoalRequest {
  goalContent: string;
}

export interface UpdateTodoRequest {
  todoContent: string;
}

export const taskApi = {
  updateGoal: async (
    taskId: number,
    body: UpdateGoalRequest
  ): Promise<ApiSuccessResponse<null>> => {
    return api.patch<ApiSuccessResponse<null>>(`/api/tasks/${taskId}`, body);
  },

  updateTodo: async (
    subtaskId: number,
    body: UpdateTodoRequest
  ): Promise<ApiSuccessResponse<null>> => {
    return api.patch<ApiSuccessResponse<null>>(`/api/subtasks/${subtaskId}`, body);
  },

  deleteTodo: async (subtaskId: number): Promise<ApiSuccessResponse<null>> => {
    return api.delete<ApiSuccessResponse<null>>(`/api/subtasks/${subtaskId}`);
  },
};
