export type MemberInterestCategory =
  | "DEVELOPMENT"
  | "DESIGN"
  | "PLANNING_PM"
  | "CAREER_SELF_DEVELOPMENT"
  | "STUDY_READING"
  | "CREATIVE"
  | "TEAM_PROJECT"
  | "FREE";

export interface MemberProfile {
  id?: number;
  nickname?: string;
  profileImageUrl?: string;
  bio?: string;
  firstInterestCategory?: MemberInterestCategory;
  secondInterestCategory?: MemberInterestCategory;
  thirdInterestCategory?: MemberInterestCategory;
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
  firstInterestCategory?: MemberInterestCategory;
  secondInterestCategory?: MemberInterestCategory;
  thirdInterestCategory?: MemberInterestCategory;
}
