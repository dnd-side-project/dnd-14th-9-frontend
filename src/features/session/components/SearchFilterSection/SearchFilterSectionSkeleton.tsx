/**
 * SearchFilterSectionSkeleton - 검색/필터 섹션 로딩 스켈레톤
 */

const SKELETON_BUTTON_WIDTHS = [48, 56, 64, 72, 96, 88, 80, 72, 48];

export function SearchFilterSectionSkeleton() {
  return (
    <section className="gap-xl flex flex-col items-center">
      {/* 검색바 스켈레톤 */}
      <div className="bg-surface-strong h-11 w-full max-w-145 animate-pulse rounded-sm md:h-14" />

      {/* 카테고리 필터 버튼 스켈레톤 */}
      <div className="gap-xs flex w-full items-start md:justify-center">
        <div className="gap-xs md:gap-sm flex min-h-[41px] min-w-0 flex-1 flex-nowrap items-center overflow-x-auto md:min-h-0 md:flex-none md:flex-wrap md:justify-center md:overflow-visible">
          {SKELETON_BUTTON_WIDTHS.map((width, i) => (
            <div
              key={i}
              className="bg-surface-strong h-[41px] shrink-0 animate-pulse rounded-sm md:h-11"
              style={{ width }}
            />
          ))}
        </div>
        <div className="bg-surface-strong border-sm rounded-max size-10 shrink-0 animate-pulse md:hidden" />
      </div>
    </section>
  );
}
