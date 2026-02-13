import type { ApiSuccessResponse } from "@/types/shared/types";

export type MemberInterestCategory =
  | "DEVELOPMENT"
  | "DESIGN"
  | "PLAN&PM"
  | "CAREER"
  | "STUDY"
  | "CREATIVE"
  | "TEAMPROJECT"
  | "FREE";

export interface MemberProfile {
  id: number;
  nickname: string;
  profileImageUrl: string | null;
  bio: string | null;
  firstInterestCategory: MemberInterestCategory;
  secondInterestCategory: MemberInterestCategory;
  thirdInterestCategory: MemberInterestCategory | null;
  firstLogin?: boolean;
}

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

export type GetMeResponse = ApiSuccessResponse<MemberProfile>;
export type GetMyReportResponse = ApiSuccessResponse<MemberReport>;
export type DeleteMeResponse = ApiSuccessResponse<null>;

export interface UpdateProfileImagePayload {
  profileImage?: File | null;
}

export interface UpdateNicknamePayload {
  nickname: string;
}

export interface UpdateInterestCategoriesPayload {
  interestCategory1: MemberInterestCategory;
  interestCategory2: MemberInterestCategory;
  interestCategory3?: MemberInterestCategory | null;
}

export type UpdateProfileImageRequest = UpdateProfileImagePayload;
export type UpdateNicknameRequest = UpdateNicknamePayload;
export type UpdateInterestCategoriesRequest = UpdateInterestCategoriesPayload;

export type UpdateProfileImageResponse = ApiSuccessResponse<MemberProfile>;
export type UpdateNicknameResponse = ApiSuccessResponse<MemberProfile>;
export type UpdateInterestCategoriesResponse = ApiSuccessResponse<MemberProfile>;

/**
 * @deprecated member 훅 리팩터(분리 mutation 전환) 전까지 유지하는 임시 호환 타입
 */
export interface UpdateMePayload {
  profileImage?: File | null;
  nickname?: string;
  interestCategory1?: MemberInterestCategory;
  interestCategory2?: MemberInterestCategory;
  interestCategory3?: MemberInterestCategory | null;
  [key: string]: unknown;
}

/**
 * @deprecated member 훅 리팩터(분리 mutation 전환) 전까지 유지하는 임시 호환 타입
 */
export type UpdateMeResponse = ApiSuccessResponse<MemberProfile>;
