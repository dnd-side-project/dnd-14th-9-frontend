"use client";

import { useSearchParams } from "next/navigation";

/**
 * RecruitingSection - 모집 중 세션
 *
 * 역할:
 * - URL searchParams 기반 필터링/페이지네이션
 * - useSuspenseQuery로 모집 중 세션 데이터 사용
 * - SearchFilterSection의 검색/카테고리 변경에 반응
 *
 * TODO(이경환): API 스펙 확정 후 구현
 * - useSuspenseQuery + Query Options
 * - 필터 UI (정렬, 진행시간, 시작시간, 인원)
 * - 페이지네이션 UI
 */
export function RecruitingSection() {
  const searchParams = useSearchParams();

  // TODO(이경환): API 스펙 확정 후 구현
  // const params = Object.fromEntries(searchParams.entries());
  // const { data } = useSuspenseQuery(homeQueries.recruiting(params));

  return (
    <section>
      <div>RecruitingSection placeholder</div>
      <pre>{JSON.stringify(Object.fromEntries(searchParams.entries()), null, 2)}</pre>
    </section>
  );
}
