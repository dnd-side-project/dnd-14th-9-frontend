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
      <div className={cn("gap-sm flex items-center justify-center", className)}>
        <button
          type="button"
          onClick={goToPreviousPage}
          disabled={isFirstPage}
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-full p-1 transition-colors md:size-10",
            isFirstPage ? "cursor-not-allowed opacity-50" : "hover:bg-surface-strong cursor-pointer"
          )}
          aria-label="Previous page"
        >
          <ChevronLeftIcon className="text-text-disabled size-4 md:size-6" />
        </button>

        <div className="gap-2xs text-text-muted flex items-center justify-center text-base font-semibold">
          <span>{normalizedCurrentPage}</span>
          <span>/</span>
          <span>{normalizedTotalPage}</span>
        </div>

        <button
          type="button"
          onClick={goToNextPage}
          disabled={isLastPage}
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-full p-1 transition-colors md:size-10",
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
      <button
        type="button"
        onClick={goToPreviousPage}
        disabled={isFirstPage}
        className={cn(
          "text-text-muted text-semibold px-sm py-xs flex items-center gap-2 rounded-[8px] transition-colors",
          isFirstPage
            ? "cursor-not-allowed opacity-50"
            : "hover:text-text-secondary active:bg-surface-strong cursor-pointer"
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
                "text-semibold px-sm py-xs flex items-center justify-center rounded-[8px] leading-4 transition-colors",
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

      <button
        type="button"
        onClick={goToNextPage}
        disabled={isLastPage}
        className={cn(
          "text-text-muted text-semibold px-sm py-xs flex items-center gap-2 rounded-[8px] transition-colors",
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
