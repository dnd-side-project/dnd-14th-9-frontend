import { ArrowLeftIcon } from "@/components/Icon/ArrowLeftIcon";
import { ArrowRightIcon } from "@/components/Icon/ArrowRightIcon";
import { ChevronLeftIcon } from "@/components/Icon/ChevronLeftIcon";
import { ChevronRightIcon } from "@/components/Icon/ChevronRightIcon";
import { cn } from "@/lib/utils/utils";

interface PaginationProps {
  /**
   * 전체 페이지 수
   */
  totalPage: number;
  /**
   * 현재 페이지 (1부터 시작)
   */
  currentPage: number;
  /**
   * 페이지 변경 핸들러
   */
  onPageChange: (page: number) => void;
  /**
   * 페이지네이션 스타일 변형
   * - list: [화살표] 이전 1 2 3 ... 10 다음 [화살표]
   * - fraction: [Chevron] 2/3 [Chevron]
   * @default "list"
   */
  variant?: "list" | "fraction";
  /**
   * 추가 클래스
   */
  className?: string;
}

const ELLIPSIS = "..." as const;
const PAGE_SLOT_COUNT = 7;
const EDGE_VISIBLE_PAGE_COUNT = 5;
const EARLY_PAGE_THRESHOLD = 4;
const LATE_PAGE_OFFSET = 3;
const SIBLING_OFFSET = 1;

type PageSlot = number | typeof ELLIPSIS | null;

function getPageSlots(totalPage: number, currentPage: number): PageSlot[] {
  if (totalPage <= PAGE_SLOT_COUNT) {
    const pages = Array.from({ length: totalPage }, (_, index) => index + 1);
    const placeholders = Array.from({ length: PAGE_SLOT_COUNT - totalPage }, () => null);
    return [...pages, ...placeholders];
  }

  // 항상 7개 슬롯을 유지해 페이지 전환 시 레이아웃 시프트를 방지한다.
  if (currentPage <= EARLY_PAGE_THRESHOLD) {
    const leadingPages = Array.from({ length: EDGE_VISIBLE_PAGE_COUNT }, (_, index) => index + 1);
    return [...leadingPages, ELLIPSIS, totalPage];
  }

  if (currentPage >= totalPage - LATE_PAGE_OFFSET) {
    const startPage = totalPage - EDGE_VISIBLE_PAGE_COUNT + 1;
    const trailingPages = Array.from(
      { length: EDGE_VISIBLE_PAGE_COUNT },
      (_, index) => startPage + index
    );
    return [1, ELLIPSIS, ...trailingPages];
  }

  return [
    1,
    ELLIPSIS,
    currentPage - SIBLING_OFFSET,
    currentPage,
    currentPage + SIBLING_OFFSET,
    ELLIPSIS,
    totalPage,
  ];
}

export function Pagination({
  totalPage,
  currentPage,
  onPageChange,
  variant = "list",
  className,
}: PaginationProps) {
  if (totalPage <= 0) {
    return null;
  }

  const normalizedCurrentPage = Math.min(Math.max(currentPage, 1), totalPage);

  const handlePageChange = (nextPage: number) => {
    const normalizedNextPage = Math.min(Math.max(nextPage, 1), totalPage);
    if (normalizedNextPage === normalizedCurrentPage) {
      return;
    }

    onPageChange(normalizedNextPage);
  };
  const isFirstPage = normalizedCurrentPage === 1;
  const isLastPage = normalizedCurrentPage === totalPage;
  const goToPreviousPage = () => handlePageChange(normalizedCurrentPage - 1);
  const goToNextPage = () => handlePageChange(normalizedCurrentPage + 1);

  if (variant === "fraction") {
    return (
      <div className={cn("flex items-center gap-[15px]", className)}>
        <button
          type="button"
          onClick={goToPreviousPage}
          disabled={isFirstPage}
          className={cn(
            "bg-alpha-white-16 flex size-10 items-center justify-center rounded-full p-1 transition-colors",
            isFirstPage ? "cursor-not-allowed opacity-50" : "hover:bg-surface-subtle cursor-pointer"
          )}
          aria-label="Previous page"
        >
          <ChevronLeftIcon className="text-text-disabled size-6" />
        </button>

        <span className="font-regular text-text-disabled text-[18px]">
          {normalizedCurrentPage}/{totalPage}
        </span>

        <button
          type="button"
          onClick={goToNextPage}
          disabled={isLastPage}
          className={cn(
            "bg-alpha-white-16 flex size-10 items-center justify-center rounded-full p-1 transition-colors",
            isLastPage ? "cursor-not-allowed opacity-50" : "hover:bg-surface-subtle cursor-pointer"
          )}
          aria-label="Next page"
        >
          <ChevronRightIcon className="text-text-disabled size-6" />
        </button>
      </div>
    );
  }

  const pages = getPageSlots(totalPage, normalizedCurrentPage);

  return (
    <div className={cn("flex items-center gap-6", className)}>
      <button
        type="button"
        onClick={goToPreviousPage}
        disabled={isFirstPage}
        className={cn(
          "text-text-disabled flex items-center gap-2 text-[16px] transition-colors",
          isFirstPage ? "cursor-not-allowed opacity-50" : "hover:text-text-secondary cursor-pointer"
        )}
        aria-label="Previous page"
      >
        <ArrowLeftIcon className="size-4" />
        <span>이전</span>
      </button>

      <div className="flex items-center gap-2">
        {pages.map((page, index) => {
          if (page === null) {
            return (
              <span key={`placeholder-${index}`} aria-hidden className="flex size-8 shrink-0" />
            );
          }

          if (page === ELLIPSIS) {
            return (
              <span
                key={`ellipsis-${index}`}
                className="text-text-disabled flex size-8 items-center justify-center text-[16px]"
              >
                ...
              </span>
            );
          }

          const isActive = page === normalizedCurrentPage;

          return (
            <button
              key={page}
              type="button"
              onClick={() => handlePageChange(page)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "font-regular flex size-8 items-center justify-center rounded-[8px] text-[16px] transition-colors",
                isActive
                  ? "bg-surface-subtle text-text-primary cursor-default"
                  : "text-text-disabled hover:bg-surface-subtle cursor-pointer"
              )}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={goToNextPage}
        disabled={isLastPage}
        className={cn(
          "text-text-disabled flex items-center gap-2 text-[16px] transition-colors",
          isLastPage ? "cursor-not-allowed opacity-50" : "hover:text-text-secondary cursor-pointer"
        )}
        aria-label="Next page"
      >
        <span>다음</span>
        <ArrowRightIcon className="size-4" />
      </button>
    </div>
  );
}
