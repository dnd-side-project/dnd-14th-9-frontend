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

/**
 * 한글 카테고리 라벨을 Category enum 값으로 역변환합니다.
 *
 * 세션 상세 응답의 category는 한글 라벨("개발")로 오지만,
 * 수정 요청·폼 상태는 enum 값("DEVELOPMENT")을 요구하므로 프리필 시 사용합니다.
 * "전체"(ALL)는 선택 대상이 아니므로 제외하며, 매칭되는 값이 없으면 null을 반환합니다.
 */
export function getCategoryValue(label: string): Category | null {
  return ONBOARDING_CATEGORIES.find((category) => CATEGORY_LABELS[category] === label) ?? null;
}
