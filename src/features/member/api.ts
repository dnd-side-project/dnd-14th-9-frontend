import { api } from "@/lib/api/api";
import type {
  DeleteMeResponse,
  GetMeResponse,
  GetMyReportResponse,
  UpdateMePayload,
  UpdateMeResponse,
} from "./types";

/**
 * Member 관련 API
 *
 * 모든 요청은 프론트 Route Handler(/api/members/*)를 경유합니다.
 */
export const memberApi = {
  getMe: async (): Promise<GetMeResponse> => {
    return api.get<GetMeResponse>("/api/members/me");
  },

  updateMe: async (payload: UpdateMePayload): Promise<UpdateMeResponse> => {
    return api.patch<UpdateMeResponse>("/api/members/me", payload);
  },

  getMyReport: async (): Promise<GetMyReportResponse> => {
    return api.get<GetMyReportResponse>("/api/members/me/report");
  },

  deleteMe: async (): Promise<DeleteMeResponse> => {
    return api.delete<DeleteMeResponse>("/api/members/me");
  },
};
