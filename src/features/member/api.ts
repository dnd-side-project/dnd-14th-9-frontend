import { api } from "@/lib/api/api";

import type {
  DeleteMeResponse,
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
    return api.get<GetMeResponse>("/api/members/me/profile");
  },

  getMeForEdit: async (): Promise<GetMeForEditResponse> => {
    return api.get<GetMeForEditResponse>("/api/members/me/edit");
  },

  updateProfileImage: async (
    body: UpdateProfileImageRequest
  ): Promise<UpdateProfileImageResponse> => {
    const formData = new FormData();
    formData.append("profileImage", body.profileImage);

    return patchProfileImage<UpdateProfileImageResponse>("/api/members/me/profile-image", formData);
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
