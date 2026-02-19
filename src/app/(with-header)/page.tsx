import { Suspense } from "react";

import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

import { sessionApi } from "@/features/session/api";
import { Banner } from "@/features/session/components/Banner/Banner";
import { RecommendedSection } from "@/features/session/components/RecommendedSection/RecommendedSection";
import { RecommendedSectionSkeleton } from "@/features/session/components/RecommendedSection/RecommendedSectionSkeleton";
import {
  DURATION_OPTIONS,
  SORT_OPTIONS,
} from "@/features/session/components/RecruitingSection/recruitingFilter.types";
import { parseParticipantsFilterValue } from "@/features/session/components/RecruitingSection/recruitingFilter.utils";
import { RecruitingSection } from "@/features/session/components/RecruitingSection/RecruitingSection";
import { RecruitingSectionSkeleton } from "@/features/session/components/RecruitingSection/RecruitingSectionSkeleton";
import { SearchFilterSection } from "@/features/session/components/SearchFilterSection/SearchFilterSection";
import { SearchFilterSectionSkeleton } from "@/features/session/components/SearchFilterSection/SearchFilterSectionSkeleton";
import { RECRUITING_PAGE_SIZE } from "@/features/session/constants/pagination";
import { sessionKeys } from "@/features/session/hooks/useSessionHooks";
import type { DurationRange, SessionCategoryFilter, SessionSort } from "@/features/session/types";
import { parsePageParam } from "@/features/session/utils/pagination";
import { parseTimeSlotsParam } from "@/features/session/utils/timeSlots";

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

function isSessionSortValue(value: string | undefined): value is SessionSort {
  if (!value) return false;
  return SORT_OPTIONS.some((option) => option.value === value);
}

function isDurationRangeValue(value: string | undefined): value is DurationRange {
  if (!value) return false;
  return DURATION_OPTIONS.some((option) => option.value === value);
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;

  const q = typeof params["q"] === "string" ? params["q"] : undefined;
  const category = (typeof params["category"] === "string" ? params["category"] : undefined) as
    | SessionCategoryFilter
    | undefined;
  const sortParam = typeof params["sort"] === "string" ? params["sort"] : undefined;
  const sort: SessionSort = isSessionSortValue(sortParam) ? sortParam : "LATEST";
  const startDate = typeof params["startDate"] === "string" ? params["startDate"] : undefined;
  const endDate = typeof params["endDate"] === "string" ? params["endDate"] : undefined;
  const durationRangeParam =
    typeof params["durationRange"] === "string" ? params["durationRange"] : undefined;
  const durationRange: DurationRange | undefined = isDurationRangeValue(durationRangeParam)
    ? durationRangeParam
    : undefined;
  const timeSlots = parseTimeSlotsParam(
    typeof params["timeSlots"] === "string" ? params["timeSlots"] : null
  );
  const participantsParam = parseParticipantsFilterValue(
    typeof params["participants"] === "string" ? params["participants"] : null
  );
  const participants = participantsParam ? Number(participantsParam) : undefined;
  const page = parsePageParam(typeof params["page"] === "string" ? params["page"] : undefined);
  const isSearchMode = !!q;

  const queryClient = new QueryClient();

  // 모집 중 세션 목록 prefetch (첫 페이지 로드 성능 최적화)
  const listParams = {
    keyword: q,
    category,
    sort,
    page,
    size: RECRUITING_PAGE_SIZE,
    startDate,
    endDate,
    timeSlots: timeSlots.length > 0 ? timeSlots : undefined,
    durationRange,
    participants,
  };
  await queryClient.prefetchQuery({
    queryKey: sessionKeys.list(listParams),
    queryFn: () => sessionApi.getList(listParams),
  });

  return (
    <div className="my-[64px] flex flex-col justify-center gap-[48px] px-[54px]">
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
