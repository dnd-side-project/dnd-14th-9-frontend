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
  const maxPagesToShow = 7;
  const siblingCount = 1;

  if (totalPage <= maxPagesToShow) {
    return Array.from({ length: totalPage }, (_, index) => index + 1);
  }

  const leftSibling = Math.max(currentPage - siblingCount, 2);
  const rightSibling = Math.min(currentPage + siblingCount, totalPage - 1);
  const pages: Array<number | typeof ELLIPSIS> = [1];

  if (leftSibling > 2) {
    pages.push(ELLIPSIS);
  }

  for (let page = leftSibling; page <= rightSibling; page += 1) {
    pages.push(page);
  }

  if (rightSibling < totalPage - 1) {
    pages.push(ELLIPSIS);
  }

  pages.push(totalPage);
  return pages;
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
            "flex size-10 items-center justify-center rounded-full bg-white/16 p-1 transition-colors",
            isFirstPage ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-gray-100"
          )}
          aria-label="Previous page"
        >
          <ChevronLeftIcon className="size-6 text-[#6d7882]" />
        </button>

        <span className="font-regular text-[18px] text-[#6d7882]">
          {normalizedCurrentPage}/{totalPage}
        </span>

        <button
          type="button"
          onClick={goToNextPage}
          disabled={isLastPage}
          className={cn(
            "flex size-10 items-center justify-center rounded-full bg-white/16 p-1 transition-colors",
            isLastPage ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-gray-100"
          )}
          aria-label="Next page"
        >
          <ChevronRightIcon className="size-6 text-[#6d7882]" />
        </button>
      </div>
    );
  }

  const pages = getPageNumbers(totalPage, normalizedCurrentPage);

  return (
    <div className={cn("flex items-center gap-6", className)}>
      <button
        type="button"
        onClick={goToPreviousPage}
        disabled={isFirstPage}
        className={cn(
          "flex items-center gap-2 text-[16px] text-[#6d7882] transition-colors",
          isFirstPage ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:text-gray-900"
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
              aria-current={isActive ? "page" : undefined}
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
        onClick={goToNextPage}
        disabled={isLastPage}
        className={cn(
          "flex items-center gap-2 text-[16px] text-[#6d7882] transition-colors",
          isLastPage ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:text-gray-900"
        )}
        aria-label="Next page"
      >
        <span>다음</span>
        <ArrowRightIcon className="size-4" />
      </button>
    </div>
  );
}
