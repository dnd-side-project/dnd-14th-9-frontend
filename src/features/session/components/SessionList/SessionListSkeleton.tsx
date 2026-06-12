import { CardSkeleton } from "../Card/CardSkeleton";

/**
 * SessionListSkeleton - 모집 중 세션 카드 그리드 로딩 스켈레톤
 *
 * SessionListContent의 카드 그리드와 동일한 반응형 구조를 유지합니다.
 */
export function SessionListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 xl:gap-y-12">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="mx-auto w-full xl:max-w-69">
          <CardSkeleton size="responsive" />
        </div>
      ))}
    </div>
  );
}
