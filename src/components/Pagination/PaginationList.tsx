import { ArrowLeftIcon } from "@/components/Icon/ArrowLeftIcon";
import { ArrowRightIcon } from "@/components/Icon/ArrowRightIcon";
import { usePagination } from "@/hooks/usePagination";
import { cn } from "@/lib/utils/utils";

import { ELLIPSIS, getPageSlots } from "./Pagination.utils";

interface PaginationListProps {
  totalPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function PaginationList({
  totalPage,
  currentPage,
  onPageChange,
  className,
}: PaginationListProps) {
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

  const pages = getPageSlots(normalizedTotalPage, normalizedCurrentPage);

  return (
    <div className={cn("flex items-center gap-6", className)}>
      <button
        type="button"
        onClick={goToPreviousPage}
        disabled={isFirstPage}
        className={cn(
          "text-text-disabled flex items-center gap-2 text-base transition-colors",
          isFirstPage ? "cursor-not-allowed opacity-50" : "hover:text-text-secondary cursor-pointer"
        )}
        aria-label="Previous page"
      >
        <ArrowLeftIcon className="size-4" />
        <span>이전</span>
      </button>

      <div className="flex w-[272px] items-center justify-center gap-2">
        {pages.map((page, index) => {
          if (page === ELLIPSIS) {
            return (
              <span
                key={`ellipsis-${index}`}
                className="text-text-disabled flex size-8 items-center justify-center text-base"
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
                "font-regular flex size-8 items-center justify-center rounded-[8px] text-base transition-colors",
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
          "text-text-disabled flex items-center gap-2 text-base transition-colors",
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
