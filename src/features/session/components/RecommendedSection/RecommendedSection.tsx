"use client";

import { useIsAuthenticated } from "@/features/member/hooks/useMemberHooks";

import { RecommendedSectionContent } from "./RecommendedSectionContent";

/**
 * RecommendedSection - 맞춤 추천 세션
 *
 * 역할:
 * - 로그인 사용자에게만 표시 (조건부 렌더링)
 * - member/me/edit의 관심 카테고리 기반 추천
 * - category 쿼리 파라미터가 "ALL" 이거나 없을 때:
 *   - firstInterestCategory → 1페이지 (4개)
 *   - secondInterestCategory → 2페이지 (4개)
 *   - thirdInterestCategory → 3페이지 (4개)
 * - category 파라미터가 지정될 때:
 *   - 관심 카테고리인 경우: 해당 카테고리 카드 노출 (페이지네이션 없음)
 *   - 관심 카테고리가 아닌 경우: EmptyRecommendedSessionPlaceholder 노출
 */
export function RecommendedSection() {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return null;
  }

  return <RecommendedSectionContent />;
}
