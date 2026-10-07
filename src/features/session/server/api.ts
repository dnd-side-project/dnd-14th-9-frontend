import "server-only";

import { api } from "@/lib/api/api";
import type { ApiSuccessResponse } from "@/types/shared/types";

import type {
  MyReportResponse,
  SessionDetailResponse,
  SessionReportResponse,
  WaitingRoomResponse,
} from "../types";

export const sessionServerApi = {
  getDetail: async (sessionId: string): Promise<ApiSuccessResponse<SessionDetailResponse>> => {
    return api.get<ApiSuccessResponse<SessionDetailResponse>>(`/sessions/${sessionId}`);
  },

  getWaitingRoom: async (sessionId: string): Promise<ApiSuccessResponse<WaitingRoomResponse>> => {
    return api.get<ApiSuccessResponse<WaitingRoomResponse>>(`/sessions/${sessionId}/waiting-room`);
  },

  getMyReport: async (sessionId: string): Promise<ApiSuccessResponse<MyReportResponse>> => {
    return api.get<ApiSuccessResponse<MyReportResponse>>(`/sessions/${sessionId}/me/report`);
  },

  getReport: async (sessionId: string): Promise<ApiSuccessResponse<SessionReportResponse>> => {
    return api.get<ApiSuccessResponse<SessionReportResponse>>(`/sessions/${sessionId}/report`);
  },
};
