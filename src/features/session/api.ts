import { api } from "@/lib/api/api";
import { buildQueryString, type QueryParams } from "@/lib/utils/url";
import type { ApiSuccessResponse } from "@/types/shared/types";

import type {
  AddTodosRequest,
  AddTodosResponse,
  CreateSessionRequest,
  CreateSessionResponse,
  JoinSessionResponse,
  SessionDetailResponse,
  SessionListParams,
  SessionListResponse,
  SessionReportResponse,
  SetGoalRequest,
  SetGoalResponse,
  ToggleTodoResponse,
} from "./types";

export const sessionApi = {
  getList: async (params: SessionListParams): Promise<ApiSuccessResponse<SessionListResponse>> => {
    const queryString = buildQueryString(params as QueryParams);
    return api.get<ApiSuccessResponse<SessionListResponse>>(`/api/sessions${queryString}`);
  },

  getDetail: async (sessionId: string): Promise<ApiSuccessResponse<SessionDetailResponse>> => {
    return api.get<ApiSuccessResponse<SessionDetailResponse>>(`/api/sessions/${sessionId}`);
  },

  getReport: async (sessionId: string): Promise<ApiSuccessResponse<SessionReportResponse>> => {
    return api.get<ApiSuccessResponse<SessionReportResponse>>(`/api/sessions/${sessionId}/report`);
  },

  createSession: async (
    body: CreateSessionRequest,
    image?: File
  ): Promise<ApiSuccessResponse<CreateSessionResponse>> => {
    const formData = new FormData();
    formData.append("request", new Blob([JSON.stringify(body)], { type: "application/json" }));
    if (image) {
      formData.append("image", image);
    }
    return api.post<ApiSuccessResponse<CreateSessionResponse>>("/api/sessions/create", formData);
  },

  join: async (sessionId: string): Promise<ApiSuccessResponse<JoinSessionResponse>> => {
    return api.post<ApiSuccessResponse<JoinSessionResponse>>(`/api/sessions/${sessionId}/join`);
  },

  setGoal: async (
    sessionRoomId: string,
    body: SetGoalRequest
  ): Promise<ApiSuccessResponse<SetGoalResponse>> => {
    return api.post<ApiSuccessResponse<SetGoalResponse>>(
      `/api/sessions/${sessionRoomId}/goal`,
      body
    );
  },

  addTodos: async (
    sessionRoomId: string,
    body: AddTodosRequest
  ): Promise<ApiSuccessResponse<AddTodosResponse>> => {
    return api.post<ApiSuccessResponse<AddTodosResponse>>(
      `/api/sessions/${sessionRoomId}/todos`,
      body
    );
  },

  toggleTodo: async (
    sessionRoomId: string,
    todoId: string
  ): Promise<ApiSuccessResponse<ToggleTodoResponse>> => {
    return api.post<ApiSuccessResponse<ToggleTodoResponse>>(
      `/api/sessions/${sessionRoomId}/todos/${todoId}/toggle`
    );
  },
};
