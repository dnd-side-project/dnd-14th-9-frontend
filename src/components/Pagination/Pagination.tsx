import { ArrowLeftIcon } from "@/components/Icon/ArrowLeftIcon";
import { ArrowRightIcon } from "@/components/Icon/ArrowRightIcon";
import { ChevronLeftIcon } from "@/components/Icon/ChevronLeftIcon";
import { ChevronRightIcon } from "@/components/Icon/ChevronRightIcon";
import { usePagination } from "@/hooks/usePagination";
import { cn } from "@/lib/utils/utils";

import { ELLIPSIS, getPageSlots } from "./Pagination.utils";

interface PaginationBaseProps {
  totalPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

interface PaginationFractionProps extends PaginationBaseProps {
  type: "fraction";
}

interface PaginationListProps extends PaginationBaseProps {
  type: "list";
}

type PaginationProps = PaginationFractionProps | PaginationListProps;

export function Pagination(props: PaginationProps) {
  const { totalPage, currentPage, onPageChange, className, type } = props;

  const {
    normalizedTotalPage,
    normalizedCurrentPage,
    isFirstPage,
    isLastPage,
    handlePageChange,
    goToPreviousPage,
    goToNextPage,
  } = usePagination({
    totalPage,
    currentPage,
    onPageChange,
  });

  if (totalPage <= 0) {
    return null;
  }

  if (type === "fraction") {
    return (
      <div className={cn("gap-xs md:gap-sm flex items-center justify-center", className)}>
        {/* 이전 버튼 */}
        <button
          type="button"
          onClick={goToPreviousPage}
          disabled={isFirstPage}
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-full p-1 transition-colors md:size-10 md:p-[4px]",
            isFirstPage ? "cursor-not-allowed opacity-50" : "hover:bg-surface-strong cursor-pointer"
          )}
          aria-label="Previous page"
        >
          <ChevronLeftIcon className="text-text-disabled size-4 md:size-6" />
        </button>

        {/* 페이지 번호: 현재(muted) / 구분자+전체(alpha-white-24) */}
        <div className="gap-2xs flex items-center justify-center text-[15px] font-semibold md:text-base">
          <span className="text-text-muted">{normalizedCurrentPage}</span>
          <span className="text-alpha-white-24">/</span>
          <span className="text-alpha-white-24">{normalizedTotalPage}</span>
        </div>

        {/* 다음 버튼 */}
        <button
          type="button"
          onClick={goToNextPage}
          disabled={isLastPage}
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-full p-1 transition-colors md:size-10 md:p-[4px]",
            isLastPage ? "cursor-not-allowed opacity-50" : "hover:bg-surface-strong cursor-pointer"
          )}
          aria-label="Next page"
        >
          <ChevronRightIcon className="text-text-disabled size-4 md:size-6" />
        </button>
      </div>
    );
  }

  // type === "list"
  const pages = getPageSlots(normalizedTotalPage, normalizedCurrentPage);

  return (
    <div className={cn("flex items-center gap-6", className)}>
      {/* 이전 버튼 */}
      <button
        type="button"
        onClick={goToPreviousPage}
        disabled={isFirstPage}
        className={cn(
          "text-text-muted px-xs py-2xs md:px-sm md:py-xs flex items-center gap-2 rounded-md text-[13px] font-semibold transition-colors md:text-base",
          isFirstPage
            ? "cursor-not-allowed opacity-50"
            : "hover:text-text-secondary active:bg-surface-strong cursor-pointer"
        )}
        aria-label="Previous page"
      >
        <ArrowLeftIcon className="size-4" />
        <span>이전</span>
      </button>

      {/* 페이지 번호 목록 */}
      <div className="flex items-center justify-center gap-1 md:gap-1">
        {pages.map((page, index) => {
          if (page === ELLIPSIS) {
            return (
              <span
                key={`ellipsis-${index}`}
                className="text-text-disabled flex size-8 items-center justify-center text-[13px] md:text-base"
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
                "flex items-center justify-center rounded-md leading-[1.4] font-semibold transition-colors",
                "md:px-md md:py-xs size-8 text-[13px] md:size-auto md:text-base",
                isActive
                  ? "bg-surface-strong text-text-primary cursor-default"
                  : "text-text-disabled hover:bg-surface-subtle cursor-pointer"
              )}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* 다음 버튼 */}
      <button
        type="button"
        onClick={goToNextPage}
        disabled={isLastPage}
        className={cn(
          "text-text-muted px-xs py-2xs md:px-sm md:py-xs flex items-center gap-2 rounded-md text-[13px] font-semibold transition-colors md:text-base",
          isLastPage
            ? "cursor-not-allowed opacity-50"
            : "hover:text-text-secondary active:bg-surface-strong cursor-pointer"
        )}
        aria-label="Next page"
      >
        <span>다음</span>
        <ArrowRightIcon className="size-4" />
      </button>
    </div>
  );
}
