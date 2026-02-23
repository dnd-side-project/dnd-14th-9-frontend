import type { Category } from "@/lib/constants/category";
import type { ApiSuccessResponse } from "@/types/shared/types";

export type MemberInterestCategory = Category;

export type MemberSocialProvider = "kakao" | "google";

// GET /members/me/profile 응답 result
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

// Report 관련 타입 정의

// Activity Summary
export interface ActivitySummaryData {
  focusedTime: number; // seconds
  totalParticipationTime: number; // seconds
  focusRate: number; // percentage (0-100)
}

// Category Participation
export interface CategoryParticipationItem {
  categoryName: Category; // 기존 Category 타입 재사용
  count: number; // session count
  rate: number; // percentage (0-100)
}

// Emoji
export type EmojiName = "HEART" | "THUMBS_UP" | "THUMBS_DOWN" | "STAR";

export interface ReceivedEmojiItem {
  emojiName: EmojiName;
  count: number; // numeric count
}

// Session Performance
export interface SessionPerformanceData {
  todoCompletionRate: number; // percentage (0-100)
  focusRate: number; // percentage (0-100)
}

// Session History
export interface SessionHistoryItem {
  sessionId: string;
  title: string;
  category: Category; // 기존 Category 타입 재사용
  currentCount: number;
  maxCapacity: number;
  durationTime: number; // seconds
  startTime: string; // ISO datetime
  focusedTime: number; // seconds
  focusRate: number; // percentage (0-100)
  todoCompletionRate: number; // percentage (0-100)
}

export interface SessionHistoryPagination {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
}

// Report Stats (통계 정보)
export interface MemberReportStats {
  activitySummary: ActivitySummaryData;
  categoryParticipation: CategoryParticipationItem[];
  receivedEmojis: ReceivedEmojiItem[];
  sessionPerformance: SessionPerformanceData;
}

// Report Sessions (세션 히스토리)
export interface MemberReportSessions {
  sessions: SessionHistoryItem[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
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
export type GetMyReportStatsResponse = ApiSuccessResponse<MemberReportStats>;
export type GetMyReportSessionsResponse = ApiSuccessResponse<MemberReportSessions>;
export type DeleteMeResponse = ApiSuccessResponse<null>;
export type DeleteProfileImageResponse = ApiSuccessResponse<null>;
