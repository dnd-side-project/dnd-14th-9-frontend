import type { Category } from "@/lib/constants/category";
import type { ApiSuccessResponse } from "@/types/shared/types";

export type MemberInterestCategory = Category;

export type MemberSocialProvider = "kakao" | "google";

// GET /members/me 응답 result
export interface MemberProfileView {
  id: number;
  nickname: string;
  profileImageUrl: string | null;
  email: string | null;
  bio: string | null;
  socialProvider: MemberSocialProvider;
  totalParticipationTime: number;
  focusedTime: number;
  focusRate: number;
  totalTodoCount: number;
  completedTodoCount: number;
  todoCompletionRate: number;
  participationSessionCount: number;
  firstLogin: boolean;
  // 관심 카테고리
  firstInterestCategory?: string;
  secondInterestCategory?: string;
  thirdInterestCategory?: string;
}

// GET /members/me/edit 응답 result
export interface MemberEditInfo {
  id: number;
  nickname: string;
  profileImageUrl: string;
  email: string | null;
  bio: string | null;
  firstInterestCategory: MemberInterestCategory | null;
  secondInterestCategory: MemberInterestCategory | null;
  thirdInterestCategory: MemberInterestCategory | null;
}

// TODO(이경환) : 추후 백엔드 명세서에 맞게 수정 필요
export interface MemberReport {
  totalParticipationTime: number;
  focusedTime: number;
  completedSessionCount: number;
  todoCompletionRate: number;
  devSessionParticipationRate: number;
  designParticipationRate: number;
  planningPmParticipationRate: number;
  careerSelfDevelopmentParticipationRate: number;
  studyReadingParticipationRate: number;
  creativeParticipationRate: number;
  teamProjectParticipationRate: number;
  freeParticipationRate: number;
}

// Request 타입
export interface UpdateProfileImageRequest {
  profileImage: File;
}

export interface UpdateNicknameRequest {
  nickname: string;
}

export interface UpdateMeRequest {
  nickname: string;
  email?: string | null;
  bio?: string | null;
  firstInterestCategory?: string | null;
  secondInterestCategory?: string | null;
  thirdInterestCategory?: string | null;
}

export interface UpdateInterestCategoriesRequest {
  firstInterestCategory: MemberInterestCategory | null;
  secondInterestCategory: MemberInterestCategory | null;
  thirdInterestCategory: MemberInterestCategory | null;
}

// Response 타입
export type GetMeResponse = ApiSuccessResponse<MemberProfileView>;
export type GetMeForEditResponse = ApiSuccessResponse<MemberEditInfo>;
export type MemberProfileMutationResponse = ApiSuccessResponse<MemberEditInfo>;
export type UpdateProfileImageResponse = ApiSuccessResponse<MemberEditInfo>;
export type UpdateNicknameResponse = ApiSuccessResponse<MemberEditInfo>;
export type UpdateMeResponse = ApiSuccessResponse<MemberEditInfo>;
export type UpdateInterestCategoriesResponse = ApiSuccessResponse<MemberEditInfo>;
export type GetMyReportResponse = ApiSuccessResponse<MemberReport>;
export type DeleteMeResponse = ApiSuccessResponse<null>;
export type DeleteProfileImageResponse = ApiSuccessResponse<null>;
