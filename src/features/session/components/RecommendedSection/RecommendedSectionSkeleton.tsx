/**
 * RecommendedSectionSkeleton - 추천 세션 로딩 스켈레톤
 */
export function RecommendedSectionSkeleton() {
  return (
    <section className="gap-xl flex flex-col">
      {/* 헤더 스켈레톤 */}
      <div className="flex items-center justify-between">
        <div className="gap-xs flex flex-col">
          <div className="bg-surface-strong h-7 w-60 animate-pulse rounded-sm" />
          <div className="bg-surface-strong h-5 w-32 animate-pulse rounded-sm" />
        </div>
        <div className="bg-surface-strong h-8 w-24 animate-pulse rounded-sm" />
      </div>

      {/* 카드 4장 그리드 스켈레톤 */}
      <div className="gap-md grid grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
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
