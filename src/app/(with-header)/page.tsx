import { HeroSection } from "@/features/session/components/HeroSection/HeroSection";
import { MainSection } from "@/features/session/components/MainSection/MainSection";
import { SESSION_LIST_PAGE_SIZE } from "@/features/session/constants/pagination";
import {
  parseSessionListSearchParams,
  toURLSearchParams,
} from "@/features/session/utils/parseSessionListSearchParams";
import { SITE_TITLE } from "@/lib/constants/seo";
import { ROOT_ROUTE } from "@/lib/routes/route-paths";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "홈",
  description: "모집 중인 모각작 세션을 찾아보고 참여하세요.",
  pathname: ROOT_ROUTE,
  openGraph: {
    title: SITE_TITLE,
  },
});

/**
 * 홈 화면 (메인 페이지)
 *
 * 데이터 흐름 아키텍처:
 * 1. page.tsx는 URL 파라미터 파싱 및 섹션 배치만 담당
 * 2. SessionListPrefetch에서 prefetch + HydrationBoundary 처리
 * 3. Suspense로 SessionList만 비동기 스트리밍
 * 4. 나머지 섹션은 독립적으로 렌더링
 *
 * 섹션 구성:
 * - SearchFilterSection: 검색창 + 카테고리 필터 (URL 상태 관리)
 * - Banner: 피드백 CTA 배너 (검색 모드가 아닐 때만 표시)
 * - RecommendedSection: 관심 카테고리 기반 추천 세션 (로그인 시 조건부 렌더링)
 * - SessionList: 모집 중 세션 (정렬 필터 + 카드 그리드 + 페이지네이션)
 */

interface HomePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const parsedParams = parseSessionListSearchParams(toURLSearchParams(await searchParams));
  const isSearchMode = Boolean(parsedParams.keyword);

  // 모집 중 세션 목록 prefetch (첫 페이지 로드 성능 최적화)
  const listParams = {
    ...parsedParams,
    size: SESSION_LIST_PAGE_SIZE,
    timeSlots: parsedParams.timeSlots.length > 0 ? parsedParams.timeSlots : undefined,
  };

  return (
    <div className="my-[64px] flex flex-col gap-10 px-5 md:px-10 xl:px-[54px]">
      <HeroSection isSearchMode={isSearchMode} />
      <MainSection listParams={listParams} />
    </div>
  );
}
