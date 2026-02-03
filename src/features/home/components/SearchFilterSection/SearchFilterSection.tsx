"use client";

/**
 * SearchFilterSection - 검색창 + 카테고리 필터
 *
 * 역할:
 * - URL searchParams 제어 (검색어, 카테고리)
 * - 사용자 입력 → URL 업데이트 → RecruitingSection 반응
 *
 * TODO(이경환): API 스펙 확정 후 구현
 * - 카테고리 목록 (백엔드 or 정적)
 * - 검색 파라미터 형식
 */
export function SearchFilterSection() {
  // const router = useRouter();
  // const searchParams = useSearchParams();

  // TODO(이경환): 검색/필터 핸들러 구현
  // const handleSearch = (query: string) => {
  //   const params = new URLSearchParams(searchParams);
  //   params.set('q', query);
  //   router.push(`?${params.toString()}`);
  // };

  return (
    <section>
      <div>SearchFilterSection placeholder</div>
    </section>
  );
}
