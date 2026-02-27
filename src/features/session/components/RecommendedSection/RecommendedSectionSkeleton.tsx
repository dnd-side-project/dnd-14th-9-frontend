import { RecommendedGridSkeleton } from "./RecommendedGridSkeleton";

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

      <RecommendedGridSkeleton />
    </section>
  );
}
