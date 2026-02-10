import { api } from "@/lib/api/api";
import { buildQueryString, type QueryParams } from "@/lib/utils/url";
import type { ApiSuccessResponse } from "@/types/shared/types";
import type {
  SessionDetailResponse,
  SessionListParams,
  SessionListResponse,
  SessionReportResponse,
} from "./types";

export const sessionApi = {
  getList: async (params: SessionListParams): Promise<ApiSuccessResponse<SessionListResponse>> => {
    const queryString = buildQueryString(params as QueryParams);
    return api.get<ApiSuccessResponse<SessionListResponse>>(`/api/sessions${queryString}`);
  },

  getDetail: async (sessionId: string): Promise<ApiSuccessResponse<SessionDetailResponse>> => {
    return api.get<ApiSuccessResponse<SessionDetailResponse>>(`/api/session/${sessionId}`);
  },

  getReport: async (sessionId: string): Promise<ApiSuccessResponse<SessionReportResponse>> => {
    return api.get<ApiSuccessResponse<SessionReportResponse>>(`/api/sessions/${sessionId}/report`);
  },
};
