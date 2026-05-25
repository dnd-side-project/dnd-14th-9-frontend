import { CardSkeleton } from "../Card/CardSkeleton";

/**
 * SessionListSkeleton - 모집 중 세션 로딩 스켈레톤
 *
 * SessionList와 동일한 반응형 구조:
 * - 헤더: 제목 + 설명 + 필터바 영역
 * - 카드 그리드: grid-cols-1 → md:grid-cols-2 → xl:grid-cols-4
 */
export function SessionListSkeleton() {
  return (
    <section className="gap-xl flex flex-col">
      {/* 헤더 스켈레톤 */}
      <div className="flex flex-col gap-[10px]">
        <div className="bg-surface-strong h-7 w-40 animate-pulse rounded-sm" />
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-5">
          <div className="bg-surface-strong h-5 w-64 animate-pulse rounded-sm" />
          {/* 필터바 스켈레톤 */}
          <div className="flex shrink-0 gap-2">
            <div className="bg-surface-strong h-9 w-20 animate-pulse rounded-md" />
            <div className="bg-surface-strong h-9 w-20 animate-pulse rounded-md" />
            <div className="bg-surface-strong h-9 w-20 animate-pulse rounded-md" />
          </div>
        </div>
      </div>

      {/* 카드 그리드 스켈레톤 (4×3 = 12장) */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 xl:gap-y-[48px]">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="mx-auto w-full xl:max-w-69">
            <CardSkeleton size="responsive" />
          </div>
        ))}
      </div>
    </section>
  );
}
