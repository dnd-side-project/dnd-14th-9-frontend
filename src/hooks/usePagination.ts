interface UsePaginationOptions {
  totalPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

interface UsePaginationResult {
  normalizedTotalPage: number;
  normalizedCurrentPage: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  handlePageChange: (nextPage: number) => void;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
}

export function usePagination({
  totalPage,
  currentPage,
  onPageChange,
}: UsePaginationOptions): UsePaginationResult {
  const normalizedTotalPage = Math.max(totalPage, 1);
  const normalizedCurrentPage = Math.min(Math.max(currentPage, 1), normalizedTotalPage);

  const handlePageChange = (nextPage: number) => {
    const normalizedNextPage = Math.min(Math.max(nextPage, 1), normalizedTotalPage);
    if (normalizedNextPage === normalizedCurrentPage) {
      return;
    }

    onPageChange(normalizedNextPage);
  };

  const isFirstPage = normalizedCurrentPage === 1;
  const isLastPage = normalizedCurrentPage === normalizedTotalPage;
  const goToPreviousPage = () => handlePageChange(normalizedCurrentPage - 1);
  const goToNextPage = () => handlePageChange(normalizedCurrentPage + 1);

  return {
    normalizedTotalPage,
    normalizedCurrentPage,
    isFirstPage,
    isLastPage,
    handlePageChange,
    goToPreviousPage,
    goToNextPage,
  };
}
