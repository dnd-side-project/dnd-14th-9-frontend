import { ChevronLeftIcon } from "@/components/Icon/ChevronLeftIcon";
import { ChevronRightIcon } from "@/components/Icon/ChevronRightIcon";
import { usePagination } from "@/hooks/usePagination";
import { cn } from "@/lib/utils/utils";

interface PaginationFractionProps {
  totalPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function PaginationFraction({
  totalPage,
  currentPage,
  onPageChange,
  className,
}: PaginationFractionProps) {
  const {
    normalizedTotalPage,
    normalizedCurrentPage,
    isFirstPage,
    isLastPage,
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

  return (
    <div className={cn("gap-sm flex items-center justify-center", className)}>
      <button
        type="button"
        onClick={goToPreviousPage}
        disabled={isFirstPage}
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full p-1 transition-colors",
          isFirstPage ? "cursor-not-allowed opacity-50" : "hover:bg-surface-strong cursor-pointer"
        )}
        aria-label="Previous page"
      >
        <ChevronLeftIcon className="text-text-disabled size-6" />
      </button>

      <div className="gap-2xs text-text-muted flex items-center justify-center text-[16px] font-semibold">
        <span>{normalizedCurrentPage}</span>
        <span>/</span>
        <span>{normalizedTotalPage}</span>
      </div>

      <button
        type="button"
        onClick={goToNextPage}
        disabled={isLastPage}
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full p-1 transition-colors",
          isLastPage ? "cursor-not-allowed opacity-50" : "hover:bg-surface-strong cursor-pointer"
        )}
        aria-label="Next page"
      >
        <ChevronRightIcon className="text-text-disabled size-6" />
      </button>
    </div>
  );
}
