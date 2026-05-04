import { CardSkeleton } from "../Card/CardSkeleton";

/**
 * RecommendedGridSkeleton - 추천 세션 카드 4장 그리드 로딩 스켈레톤
 */
export function RecommendedGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-y-[48px]">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="mx-auto w-full md:max-w-69">
          <CardSkeleton size="responsive" />
        </div>
      ))}
    </div>
  );
}
