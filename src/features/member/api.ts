import { api } from "@/lib/api/api";

import type {
  DeleteMeResponse,
  DeleteProfileImageResponse,
  GetMeForEditResponse,
  GetMeResponse,
  GetMyReportResponse,
  UpdateInterestCategoriesRequest,
  UpdateInterestCategoriesResponse,
  UpdateMeRequest,
  UpdateMeResponse,
  UpdateNicknameRequest,
  UpdateNicknameResponse,
  UpdateProfileImageRequest,
  UpdateProfileImageResponse,
} from "./types";

const AUTH_MEMBER_QUERY_OPTIONS = {
  // 인증 실패를 빠르게 surface하고, 지수 백오프로 인한 초기 로딩 지연을 방지한다.
  retry: { maxRetries: 0 },
  timeout: 5000,
} as const;

async function patchProfileImage<T>(endpoint: string, body: FormData): Promise<T> {
  const response = await fetch(endpoint, {
    method: "PATCH",
    credentials: "include",
    body,
  });

  const responseData = (await response.json()) as T;

  if (!response.ok) {
    const message =
      typeof responseData === "object" &&
      responseData !== null &&
      "message" in responseData &&
      typeof (responseData as { message?: unknown }).message === "string"
        ? (responseData as { message: string }).message
        : "요청에 실패했습니다.";

    throw new Error(message);
  }

  return responseData;
}

/**
 * Member 관련 API
 *
 * 모든 요청은 프론트 Route Handler(/api/members/*)를 경유합니다.
 */
export const memberApi = {
  getMe: async (): Promise<GetMeResponse> => {
    return api.get<GetMeResponse>("/api/members/me/profile", AUTH_MEMBER_QUERY_OPTIONS);
  },

  getMeForEdit: async (): Promise<GetMeForEditResponse> => {
    return api.get<GetMeForEditResponse>("/api/members/me/edit", AUTH_MEMBER_QUERY_OPTIONS);
  },

  updateProfileImage: async (
    body: UpdateProfileImageRequest
  ): Promise<UpdateProfileImageResponse> => {
    const formData = new FormData();
    formData.append("profileImage", body.profileImage);

    return patchProfileImage<UpdateProfileImageResponse>("/api/members/me/profile-image", formData);
  },

  deleteProfileImage: async (): Promise<DeleteProfileImageResponse> => {
    return api.delete<DeleteProfileImageResponse>("/api/members/me/profile-image");
  },

  updateNickname: async (body: UpdateNicknameRequest): Promise<UpdateNicknameResponse> => {
    return api.patch<UpdateNicknameResponse>("/api/members/me/nickname", body);
  },

  updateMe: async (body: UpdateMeRequest): Promise<UpdateMeResponse> => {
    return api.patch<UpdateMeResponse>("/api/members/me", body);
  },

  updateInterestCategories: async (
    body: UpdateInterestCategoriesRequest
  ): Promise<UpdateInterestCategoriesResponse> => {
    return api.patch<UpdateInterestCategoriesResponse>("/api/members/me/interest-categories", body);
  },

  getMyReport: async (): Promise<GetMyReportResponse> => {
    return api.get<GetMyReportResponse>("/api/members/me/report");
  },

  deleteMe: async (): Promise<DeleteMeResponse> => {
    return api.delete<DeleteMeResponse>("/api/members/me");
  },
};
