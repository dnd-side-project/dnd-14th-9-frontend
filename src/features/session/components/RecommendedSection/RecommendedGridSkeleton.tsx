import { CardSkeleton } from "../Card/CardSkeleton";

/**
 * RecommendedGridSkeleton - 추천 세션 카드 4장 그리드 로딩 스켈레톤
 */
export function RecommendedGridSkeleton() {
  return (
    <div className="gap-md grid grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
