import { CardSkeleton } from "../Card/CardSkeleton";

/**
 * RecommendedGridSkeleton - 추천 세션 카드 4장 그리드 로딩 스켈레톤
 *
 * RecommendedGrid와 동일한 반응형 구조:
 * - mobile(md 미만): 가로 스크롤 + 우측 fade overlay
 * - tablet/desktop(md 이상): grid (2열 → xl 4열)
 */
export function RecommendedGridSkeleton() {
  return (
    <>
      {/* Mobile: 가로 스크롤 */}
      <div className="relative md:hidden">
        <div className="scrollbar-hide flex gap-6 overflow-x-auto pb-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-[226px] shrink-0">
              <CardSkeleton size="sm" />
            </div>
          ))}
        </div>
        {/* 우측 fade overlay */}
        <div
          aria-hidden="true"
          className="from-surface-default pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l to-transparent"
        />
      </div>

      {/* Tablet / Desktop: grid */}
      <div className="hidden min-h-[300px] grid-cols-2 gap-6 md:grid xl:grid-cols-4 xl:gap-y-[48px]">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="mx-auto w-full xl:max-w-69">
            <CardSkeleton size="responsive" />
          </div>
        ))}
      </div>
    </>
  );
}
