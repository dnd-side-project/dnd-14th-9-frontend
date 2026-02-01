import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

/**
 * 홈 화면 (메인 페이지)
 *
 * 데이터 흐름 아키텍처:
 * 1. Server Component에서 prefetchQuery로 데이터 미리 로드
 * 2. dehydrate로 QueryClient 상태 직렬화
 * 3. HydrationBoundary로 클라이언트에 상태 전달
 * 4. 각 섹션 컴포넌트에서 useSuspenseQuery로 즉시 사용
 *
 * 섹션 구성:
 * - HeroSection: 검색창 + 카테고리 필터 (URL 상태 관리)
 * - FeedbackBanner: 정적/단순 컴포넌트
 * - RecommendedSection: 추천 세션 (로그인 시 조건부 렌더링)
 * - RecruitingSection: 모집 중 세션 (필터 + 페이지네이션)
 */

interface HomePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const queryClient = new QueryClient();

  /**
   * TODO(이경환): API 스펙 확정 후 prefetch 구현
   *
   * await queryClient.prefetchQuery(homeQueries.recommended());
   * await queryClient.prefetchQuery(homeQueries.recruiting(params));
   */

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* HeroSection - 검색창 + 카테고리 필터, URL searchParams 제어 */}

      {/* FeedbackBanner - 정적 배너 컴포넌트 */}

      {/* RecommendedSection - 로그인 사용자만 표시 (조건부 렌더링) */}
      {/* TODO(이경환): 팀 논의 필요 - 비로그인 시 빈 공간 vs 대체 콘텐츠 */}

      {/* RecruitingSection - 모집 중 세션 목록, 필터/페이지네이션 */}

      {/* 임시: 기존 콘텐츠 */}
      <h1>Page</h1>
      <pre>{JSON.stringify(params, null, 2)}</pre>
    </HydrationBoundary>
  );
}
