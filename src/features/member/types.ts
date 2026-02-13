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

// Request 타입
export interface UpdateProfileImageRequest {
  profileImage?: File | null;
}

export interface UpdateNicknameRequest {
  nickname: string;
}

export interface UpdateInterestCategoriesRequest {
  firstInterestCategory: MemberInterestCategory;
  secondInterestCategory: MemberInterestCategory;
  thirdInterestCategory?: MemberInterestCategory | null;
}
