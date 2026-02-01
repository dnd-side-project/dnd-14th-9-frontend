"use client";

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
  // TODO(이경환): 로그인 상태 확인
  // const isLoggedIn = useAuth();
  // if (!isLoggedIn) return null;

  // TODO(이경환): API 스펙 확정 후 구현
  // const { data } = useSuspenseQuery(homeQueries.recommended());

  return (
    <section>
      <div>RecommendedSection placeholder</div>
    </section>
  );
}
