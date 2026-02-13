import { api } from "@/lib/api/api";
import type { ApiSuccessResponse } from "@/types/shared/types";

import type {
  MemberProfile,
  MemberReport,
  UpdateMePayload,
  UpdateInterestCategoriesRequest,
  UpdateNicknameRequest,
  UpdateProfileImageRequest,
} from "./types";

async function patchMultipart<T>(endpoint: string, body: FormData): Promise<T> {
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
  getMe: async (): Promise<ApiSuccessResponse<MemberProfile>> => {
    return api.get<ApiSuccessResponse<MemberProfile>>("/api/members/me");
  },

  updateProfileImage: async (
    body: UpdateProfileImageRequest
  ): Promise<ApiSuccessResponse<MemberProfile>> => {
    const formData = new FormData();

    if (body.profileImage) {
      formData.append("profileImage", body.profileImage);
    }

    return patchMultipart<ApiSuccessResponse<MemberProfile>>(
      "/api/members/me/profile-image",
      formData
    );
  },

  updateNickname: async (
    body: UpdateNicknameRequest
  ): Promise<ApiSuccessResponse<MemberProfile>> => {
    return api.patch<ApiSuccessResponse<MemberProfile>>("/api/members/me/nickname", body);
  },

  updateInterestCategories: async (
    body: UpdateInterestCategoriesRequest
  ): Promise<ApiSuccessResponse<MemberProfile>> => {
    return api.patch<ApiSuccessResponse<MemberProfile>>(
      "/api/members/me/interest-categories",
      body
    );
  },

  /**
   * @deprecated 분리된 updateProfileImage / updateNickname / updateInterestCategories 사용 권장
   */
  updateMe: async (payload: UpdateMePayload): Promise<ApiSuccessResponse<MemberProfile>> => {
    if (payload.profileImage !== undefined) {
      return memberApi.updateProfileImage({ profileImage: payload.profileImage });
    }

    if (payload.nickname !== undefined) {
      return memberApi.updateNickname({ nickname: payload.nickname });
    }

    if (payload.interestCategory1 && payload.interestCategory2) {
      return memberApi.updateInterestCategories({
        interestCategory1: payload.interestCategory1,
        interestCategory2: payload.interestCategory2,
        interestCategory3: payload.interestCategory3,
      });
    }

    throw new Error("지원하지 않는 회원 정보 수정 payload입니다.");
  },

  getMyReport: async (): Promise<ApiSuccessResponse<MemberReport>> => {
    return api.get<ApiSuccessResponse<MemberReport>>("/api/members/me/report");
  },

  deleteMe: async (): Promise<ApiSuccessResponse<null>> => {
    return api.delete<ApiSuccessResponse<null>>("/api/members/me");
  },
};
