import { api } from "@/lib/api/api";
import { buildQueryString, type QueryParams } from "@/lib/utils/url";
import type { ApiSuccessResponse } from "@/types/shared/types";

import type {
  CreateSessionRequest,
  CreateSessionResponse,
  InProgressEventData,
  JoinSessionRequest,
  JoinSessionResponse,
  SessionDetailResponse,
  SessionListParams,
  SessionListResponse,
  SessionReportResponse,
  SubmitSessionResultRequest,
  SubmitSessionResultResponse,
  ToggleMyStatusResponse,
  WaitingRoomResponse,
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

  join: async (
    sessionId: string,
    body: JoinSessionRequest
  ): Promise<ApiSuccessResponse<JoinSessionResponse>> => {
    return api.post<ApiSuccessResponse<JoinSessionResponse>>(
      `/api/sessions/${sessionId}/join`,
      body
    );
  },

  getInProgress: async (sessionId: string): Promise<ApiSuccessResponse<InProgressEventData>> => {
    return api.get<ApiSuccessResponse<InProgressEventData>>(
      `/api/sessions/${sessionId}/in-progress`
    );
  },

  toggleSubtaskCompletion: async (subtaskId: number): Promise<ApiSuccessResponse<null>> => {
    return api.post<ApiSuccessResponse<null>>(`/api/subtasks/${subtaskId}/completion`);
  },

  getWaitingRoom: async (sessionId: string): Promise<ApiSuccessResponse<WaitingRoomResponse>> => {
    return api.get<ApiSuccessResponse<WaitingRoomResponse>>(
      `/api/sessions/${sessionId}/waiting-room`
    );
  },

  leave: async (sessionId: string): Promise<ApiSuccessResponse<null>> => {
    return api.delete<ApiSuccessResponse<null>>(`/api/sessions/${sessionId}/leave`);
  },

  kickMembers: async (
    sessionId: string,
    memberIds: number[]
  ): Promise<ApiSuccessResponse<null>> => {
    return api.delete<ApiSuccessResponse<null>>(`/api/sessions/${sessionId}/members`, {
      memberIds,
    });
  },

  submitResult: async (
    sessionId: string,
    body: SubmitSessionResultRequest
  ): Promise<ApiSuccessResponse<SubmitSessionResultResponse>> => {
    return api.post<ApiSuccessResponse<SubmitSessionResultResponse>>(
      `/api/sessions/${sessionId}/results`,
      body
    );
  },

  toggleMyStatus: async (
    sessionId: string
  ): Promise<ApiSuccessResponse<ToggleMyStatusResponse>> => {
    return api.post<ApiSuccessResponse<ToggleMyStatusResponse>>(
      `/api/sessions/${sessionId}/me/status`
    );
  },
};
