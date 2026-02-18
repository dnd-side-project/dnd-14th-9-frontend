import { Suspense } from "react";

import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

import { sessionApi } from "@/features/session/api";
import { Banner } from "@/features/session/components/Banner/Banner";
import { RecommendedSection } from "@/features/session/components/RecommendedSection/RecommendedSection";
import { RecommendedSectionSkeleton } from "@/features/session/components/RecommendedSection/RecommendedSectionSkeleton";
import { RecruitingSection } from "@/features/session/components/RecruitingSection/RecruitingSection";
import { RecruitingSectionSkeleton } from "@/features/session/components/RecruitingSection/RecruitingSectionSkeleton";
import { SearchFilterSection } from "@/features/session/components/SearchFilterSection/SearchFilterSection";
import { SearchFilterSectionSkeleton } from "@/features/session/components/SearchFilterSection/SearchFilterSectionSkeleton";
import { sessionKeys } from "@/features/session/hooks/useSessionHooks";
import type { SessionCategoryFilter, SessionSort } from "@/features/session/types";

/**
 * 홈 화면 (메인 페이지)
 *
 * 데이터 흐름 아키텍처:
 * 1. Server Component에서 prefetchQuery로 데이터 미리 로드
 * 2. dehydrate로 QueryClient 상태 직렬화
 * 3. HydrationBoundary로 클라이언트에 상태 전달
 * 4. 각 섹션 컴포넌트에서 useQuery로 즉시 사용
 *
 * 섹션 구성:
 * - SearchFilterSection: 검색창 + 카테고리 필터 (URL 상태 관리)
 * - Banner: 피드백 CTA 배너 (검색 모드가 아닐 때만 표시)
 * - RecommendedSection: 관심 카테고리 기반 추천 세션 (로그인 시 조건부 렌더링)
 * - RecruitingSection: 모집 중 세션 (정렬 필터 + 카드 그리드 + 페이지네이션)
 */

interface HomePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;

  const q = typeof params["q"] === "string" ? params["q"] : undefined;
  const category = (typeof params["category"] === "string" ? params["category"] : undefined) as
    | SessionCategoryFilter
    | undefined;
  const sort = (typeof params["sort"] === "string" ? params["sort"] : "LATEST") as SessionSort;
  const page = typeof params["page"] === "string" ? Number(params["page"]) : 1;
  const isSearchMode = !!q;

  const queryClient = new QueryClient();

  // 모집 중 세션 목록 prefetch (첫 페이지 로드 성능 최적화)
  const listParams = { keyword: q, category, sort, page, size: 12 };
  await queryClient.prefetchQuery({
    queryKey: sessionKeys.list(listParams),
    queryFn: () => sessionApi.getList(listParams),
  });

  return (
    <div className="gap-4xl flex flex-col px-[54px]">
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
    </div>
  );
}
