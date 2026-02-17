"use client";

import { useIsAuthenticated, useMe } from "@/features/member/hooks/useMemberHooks";

/**
 * RecommendedSection - 추천 세션
 *
 * 역할:
 * - 로그인 사용자에게만 표시 (조건부 렌더링)
 * - useSuspenseQuery로 추천 세션 데이터 사용
 * - URL searchParams와 무관 (독립적 데이터)
 *
 * TODO(이경환): API 스펙 확정 후 구현
 * - useSuspenseQuery + Query Options
 *
 * TODO(이경환): 팀 논의 필요
 * - 비로그인 시 빈 공간 vs 대체 콘텐츠
 */
export function RecommendedSection() {
  const isAuthenticated = useIsAuthenticated();
  const { data } = useMe();
  const nickname = data?.result.nickname ?? "회원";
  const title = isAuthenticated ? `${nickname}님을 위한 맞춤 추천 세션` : "맞춤 추천 세션";

  return (
    <section>
      <h2>{title}</h2>
      <div>RecommendedSection placeholder</div>
    </section>
  );
}
