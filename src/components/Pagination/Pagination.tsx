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

function getPageNumbers(totalPage: number, currentPage: number) {
  const maxPagesToShow = 5;

  if (totalPage <= maxPagesToShow) {
    return Array.from({ length: totalPage }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, ELLIPSIS, totalPage];
  }

  if (currentPage >= totalPage - 2) {
    return [1, ELLIPSIS, totalPage - 2, totalPage - 1, totalPage];
  }

  return [1, ELLIPSIS, currentPage, ELLIPSIS, totalPage];
}

export function Pagination({
  totalPage,
  currentPage,
  onPageChange,
  variant = "list",
  className,
}: PaginationProps) {
  const normalizedTotalPage = Math.max(totalPage, 1);
  const normalizedCurrentPage = Math.min(Math.max(currentPage, 1), normalizedTotalPage);

  const handlePageChange = (nextPage: number) => {
    const normalizedNextPage = Math.min(Math.max(nextPage, 1), normalizedTotalPage);
    if (normalizedNextPage === normalizedCurrentPage) {
      return;
    }

    onPageChange(normalizedNextPage);
  };

  if (variant === "fraction") {
    return (
      <div className={cn("flex items-center gap-[15px]", className)}>
        <button
          type="button"
          onClick={() => handlePageChange(normalizedCurrentPage - 1)}
          disabled={normalizedCurrentPage === 1}
          className={cn(
            "flex size-10 items-center justify-center rounded-full bg-white/16 p-1 transition-colors",
            normalizedCurrentPage === 1
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:bg-gray-100"
          )}
          aria-label="Previous page"
        >
          <ChevronLeftIcon className="size-6 text-[#6d7882]" />
        </button>

        <span className="font-regular text-[18px] text-[#6d7882]">
          {normalizedCurrentPage}/{normalizedTotalPage}
        </span>

        <button
          type="button"
          onClick={() => handlePageChange(normalizedCurrentPage + 1)}
          disabled={normalizedCurrentPage === normalizedTotalPage}
          className={cn(
            "flex size-10 items-center justify-center rounded-full bg-white/16 p-1 transition-colors",
            normalizedCurrentPage === normalizedTotalPage
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:bg-gray-100"
          )}
          aria-label="Next page"
        >
          <ChevronRightIcon className="size-6 text-[#6d7882]" />
        </button>
      </div>
    );
  }

  const pages = getPageNumbers(normalizedTotalPage, normalizedCurrentPage);

  return (
    <div className={cn("flex items-center gap-6", className)}>
      <button
        type="button"
        onClick={() => handlePageChange(normalizedCurrentPage - 1)}
        disabled={normalizedCurrentPage === 1}
        className={cn(
          "flex items-center gap-2 text-[16px] text-[#6d7882] transition-colors",
          normalizedCurrentPage === 1
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer hover:text-gray-900"
        )}
        aria-label="Previous page"
      >
        <ArrowLeftIcon className="size-4" />
        <span>이전</span>
      </button>

      <div className="flex items-center gap-2">
        {pages.map((page, index) => {
          if (page === ELLIPSIS) {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex size-8 items-center justify-center text-[16px] text-[#6d7882]"
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
              className={cn(
                "font-regular flex size-8 items-center justify-center rounded-[8px] text-[16px] transition-colors",
                isActive
                  ? "cursor-default bg-[#323635] text-white"
                  : "cursor-pointer text-[#6d7882] hover:bg-gray-100"
              )}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => handlePageChange(normalizedCurrentPage + 1)}
        disabled={normalizedCurrentPage === normalizedTotalPage}
        className={cn(
          "flex items-center gap-2 text-[16px] text-[#6d7882] transition-colors",
          normalizedCurrentPage === normalizedTotalPage
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer hover:text-gray-900"
        )}
        aria-label="Next page"
      >
        <span>다음</span>
        <ArrowRightIcon className="size-4" />
      </button>
    </div>
  );
}
