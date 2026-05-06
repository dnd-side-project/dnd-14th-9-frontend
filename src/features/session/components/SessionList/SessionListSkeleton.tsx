import { CardSkeleton } from "../Card/CardSkeleton";

/**
 * SessionListSkeleton - 모집 중 세션 로딩 스켈레톤
 */
export function SessionListSkeleton() {
  return (
    <section className="gap-xl flex flex-col">
      {/* 헤더 + 필터 스켈레톤 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="bg-surface-strong h-7 w-40 animate-pulse rounded-sm" />
        <div className="bg-surface-strong h-10 w-20 animate-pulse rounded-sm" />
      </div>

      {/* 카드 그리드 스켈레톤 (4×3 = 12장) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-y-[48px]">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="mx-auto w-full md:max-w-69">
            <CardSkeleton size="responsive" />
          </div>
        ))}
      </div>
    </section>
  );
}
