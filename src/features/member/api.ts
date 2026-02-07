import { api } from "@/lib/api/api";
import type {
  CheckNicknameExistsResponse,
  DeleteMeResponse,
  GetMeResponse,
  GetMyReportResponse,
  UpdateMePayload,
  UpdateMeResponse,
} from "./types";

/**
 * Member 관련 API
 *
 * 모든 요청은 프론트 Route Handler(/members/*)를 경유합니다.
 */
export const memberApi = {
  getMe: async (): Promise<GetMeResponse> => {
    return api.get<GetMeResponse>("/members/me");
  },

  updateMe: async (payload: UpdateMePayload): Promise<UpdateMeResponse> => {
    return api.patch<UpdateMeResponse>("/members/me", payload);
  },

  getMyReport: async (): Promise<GetMyReportResponse> => {
    return api.get<GetMyReportResponse>("/members/me/report");
  },

  deleteMe: async (): Promise<DeleteMeResponse> => {
    return api.delete<DeleteMeResponse>("/members/me");
  },

  checkNicknameExists: async (nickname: string): Promise<CheckNicknameExistsResponse> => {
    return api.get<CheckNicknameExistsResponse>("/members/nickname/exists", {
      params: { nickname },
    });
  },
};
