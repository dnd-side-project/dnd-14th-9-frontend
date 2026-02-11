import { Suspense } from "react";

import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

import { Banner } from "@/features/home/components/Banner/Banner";
import { RecommendedSection } from "@/features/home/components/RecommendedSection/RecommendedSection";
import { RecommendedSectionSkeleton } from "@/features/home/components/RecommendedSection/RecommendedSectionSkeleton";
import { RecruitingSection } from "@/features/home/components/RecruitingSection/RecruitingSection";
import { RecruitingSectionSkeleton } from "@/features/home/components/RecruitingSection/RecruitingSectionSkeleton";
import { SearchFilterSection } from "@/features/home/components/SearchFilterSection/SearchFilterSection";
import { SearchFilterSectionSkeleton } from "@/features/home/components/SearchFilterSection/SearchFilterSectionSkeleton";

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
 * - SearchFilterSection: 검색창 + 카테고리 필터 (URL 상태 관리)
 * - Banner: 정적/단순 컴포넌트
 * - RecommendedSection: 추천 세션 (로그인 시 조건부 렌더링)
 * - RecruitingSection: 모집 중 세션 (필터 + 페이지네이션)
 */

interface HomePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const q = params["q"];
  const isSearchMode = !!q;

  const queryClient = new QueryClient();

  /**
   * TODO(이경환): API 스펙 확정 후 prefetch 구현
   *
   * await queryClient.prefetchQuery(homeQueries.recommended());
   * await queryClient.prefetchQuery(homeQueries.recruiting(params));
   */
  // params는 prefetch 시 사용 예정
  void params;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<SearchFilterSectionSkeleton />}>
        <SearchFilterSection />
      </Suspense>

      {!isSearchMode && <Banner />}

      {/* TODO(이경환): 팀 논의 필요 - 비로그인 시 빈 공간 vs 대체 콘텐츠 */}
      <Suspense fallback={<RecommendedSectionSkeleton />}>
        <RecommendedSection />
      </Suspense>

      <Suspense fallback={<RecruitingSectionSkeleton />}>
        <RecruitingSection />
      </Suspense>
    </HydrationBoundary>
  );
}
