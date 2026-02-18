/**
 * SearchFilterSectionSkeleton - 검색/필터 섹션 로딩 스켈레톤
 */

const SKELETON_BUTTON_WIDTHS = [48, 56, 64, 72, 96, 88, 80, 72, 48];

export function SearchFilterSectionSkeleton() {
  return (
    <section className="gap-lg flex flex-col items-center">
      {/* 검색바 스켈레톤 */}
      <div className="bg-surface-strong h-14 w-full max-w-145 animate-pulse rounded-sm" />

      {/* 카테고리 필터 버튼 스켈레톤 */}
      <div className="gap-xs flex flex-wrap justify-center">
        {SKELETON_BUTTON_WIDTHS.map((width, i) => (
          <div
            key={i}
            className="bg-surface-strong h-9 animate-pulse rounded-sm"
            style={{ width }}
          />
        ))}
      </div>
    </section>
  );
}
