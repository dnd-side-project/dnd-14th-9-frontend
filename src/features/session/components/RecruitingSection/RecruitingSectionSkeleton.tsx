/**
 * RecruitingSectionSkeleton - 모집 중 세션 로딩 스켈레톤
 */
export function RecruitingSectionSkeleton() {
  return (
    <section className="gap-xl flex flex-col">
      {/* 헤더 + 필터 스켈레톤 */}
      <div className="flex items-center justify-between">
        <div className="bg-surface-strong h-7 w-40 animate-pulse rounded-sm" />
        <div className="bg-surface-strong h-10 w-20 animate-pulse rounded-sm" />
      </div>

      {/* 카드 그리드 스켈레톤 (4×3 = 12장) */}
      <div className="gap-md grid grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="gap-sm flex flex-col">
            <div className="bg-surface-strong aspect-[4/3] animate-pulse rounded-lg" />
            <div className="bg-surface-strong h-5 w-3/4 animate-pulse rounded-sm" />
            <div className="bg-surface-strong h-4 w-1/2 animate-pulse rounded-sm" />
            <div className="bg-surface-strong h-4 w-full animate-pulse rounded-sm" />
          </div>
        ))}
      </div>
    </section>
  );
}
