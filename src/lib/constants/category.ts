export const ONBOARDING_CATEGORIES = [
  "DEVELOPMENT",
  "DESIGN",
  "PLANNING_PM",
  "CAREER_SELF_DEVELOPMENT",
  "STUDY_READING",
  "CREATIVE",
  "TEAM_PROJECT",
  "FREE",
] as const;

export const CATEGORIES = ["ALL", ...ONBOARDING_CATEGORIES] as const;

export type Category = (typeof ONBOARDING_CATEGORIES)[number];
export type CategoryFilter = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  ALL: "전체",
  DEVELOPMENT: "개발",
  DESIGN: "디자인",
  PLANNING_PM: "기획 · PM",
  CAREER_SELF_DEVELOPMENT: "커리어 · 자기계발",
  STUDY_READING: "스터디 · 독서",
  CREATIVE: "크리에이티브",
  TEAM_PROJECT: "팀 프로젝트",
  FREE: "자유",
};

export function getCategoryLabel(category: CategoryFilter): string {
  return CATEGORY_LABELS[category];
}
