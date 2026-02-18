"use client";

import { useMe } from "@/features/member/hooks/useMemberHooks";
import { useAuthStore } from "@/stores/authStore";

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
 * - 로그인 상태 확인 로직
 *
 * TODO(이경환): 팀 논의 필요
 * - 비로그인 시 빈 공간 vs 대체 콘텐츠
 */
export function RecommendedSection() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const title = isAuthenticated ? <AuthenticatedTitle /> : "맞춤 추천 세션";

  return (
    <section>
      <h2>{title}</h2>
      <div>RecommendedSection placeholder</div>
    </section>
  );
}

function AuthenticatedTitle() {
  const { data } = useMe();
  const nickname = data?.result.nickname ?? "회원";

  return <>{nickname}님을 위한 맞춤 추천 세션</>;
}
