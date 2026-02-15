export const MEMBER_INTEREST_CATEGORIES = [
  "DEVELOPMENT",
  "DESIGN",
  "PLANNING_PM",
  "CAREER_SELF_DEVELOPMENT",
  "STUDY_READING",
  "CREATIVE",
  "TEAM_PROJECT",
  "FREE",
] as const;

export type MemberInterestCategory = (typeof MEMBER_INTEREST_CATEGORIES)[number];

export const MEMBER_INTEREST_CATEGORY_LABELS: Record<MemberInterestCategory, string> = {
  DEVELOPMENT: "개발",
  DESIGN: "디자인",
  PLANNING_PM: "기획 / PM",
  CAREER_SELF_DEVELOPMENT: "커리어 · 자기계발",
  STUDY_READING: "스터디 · 독서",
  CREATIVE: "크리에이티브",
  TEAM_PROJECT: "팀 프로젝트",
  FREE: "자유",
};

export function getMemberInterestCategoryLabel(category: MemberInterestCategory): string {
  return MEMBER_INTEREST_CATEGORY_LABELS[category];
}
