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
        {normalizedCurrentPage}/{normalizedTotalPage}
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
