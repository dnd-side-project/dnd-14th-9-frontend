"use client";

import { useState, useCallback } from "react";

/**
 * useRecommendedCarousel - 추천 세션 캐러셀 슬라이드 관리
 *
 * @param totalPages - 총 페이지 수 (관심 카테고리 수, 최대 3)
 */
export function useRecommendedCarousel(totalPages: number) {
  const [currentPage, setCurrentPage] = useState(1);

  const safeTotal = Math.max(totalPages, 1);

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(Math.max(1, Math.min(page, safeTotal)));
    },
    [safeTotal]
  );

  return {
    currentPage,
    totalPages: safeTotal,
    handlePageChange,
  };
}
