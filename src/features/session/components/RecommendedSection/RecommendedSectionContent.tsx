"use client";

import { useCallback, useState, type ReactNode } from "react";

import { useSearchParams } from "next/navigation";

import { PaginationFraction } from "@/components/Pagination/PaginationFraction";
import { useSuspenseMeForEdit } from "@/features/member/hooks/useMemberHooks";
import { parseSessionListSearchParams } from "@/features/session/utils/parseSessionListSearchParams";
import { getCategoryLabel } from "@/lib/constants/category";

import { useRecommendedCarousel } from "../../hooks/useRecommendedCarousel";

import { EmptyRecommendedSessionPlaceholder } from "./EmptyRecommendedSessionPlaceholder";
import { RecommendedGrid } from "./RecommendedGrid";
import { collectInterestCategories, resolveRecommendedView } from "./recommendedSection.model";

export function RecommendedSectionContent() {
  const searchParams = useSearchParams();
  const parsedParams = parseSessionListSearchParams(searchParams);
  const { keyword, category, startDate, endDate, durationRange, timeSlots, participants } =
    parsedParams;

  const { data: editData } = useSuspenseMeForEdit();

  const nickname = editData?.result.nickname ?? "";
  const interestCategories = collectInterestCategories([
    editData?.result.firstInterestCategory,
    editData?.result.secondInterestCategory,
    editData?.result.thirdInterestCategory,
  ]);

  const { currentPage, totalPages, handlePageChange } = useRecommendedCarousel(
    interestCategories.length
  );

  // 검색 모드 페이지네이션
  const [searchPage, setSearchPage] = useState(1);
  const [searchTotalPage, setSearchTotalPage] = useState(1);

  const handleSearchPageChange = useCallback(
    (page: number) => {
      setSearchPage(Math.max(1, Math.min(page, Math.max(searchTotalPage, 1))));
    },
    [searchTotalPage]
  );

  const handleMetaChange = useCallback((meta: { totalPage: number }) => {
    setSearchTotalPage(meta.totalPage);
  }, []);

  // 검색 모드: keyword가 있으면 검색 전용 섹션 표시
  if (keyword) {
    return (
      <section className="gap-xl flex flex-col">
        <div className="flex items-center justify-between">
          <div className="gap-xs flex flex-col">
            <h2 className="text-text-primary text-2xl font-bold">지금 바로 참여할 수 있는 세션</h2>
            <p className="text-text-disabled text-base">
              입력한 검색어와 연관된 세션 중 바로 참여 가능한 방을 우선 보여드려요
            </p>
          </div>
          <PaginationFraction
            currentPage={searchPage}
            totalPage={searchTotalPage}
            onPageChange={handleSearchPageChange}
          />
        </div>
        <RecommendedGrid
          keyword={keyword}
          category={category !== "ALL" ? category : undefined}
          filters={{
            startDate: startDate ?? undefined,
            endDate: endDate ?? undefined,
            timeSlots: timeSlots.length > 0 ? timeSlots : undefined,
            durationRange: durationRange ?? undefined,
            participants: participants ?? undefined,
          }}
          page={searchPage}
          onMetaChange={handleMetaChange}
          emptyMessage="바로 참여 가능한 세션이 없습니다"
        />
      </section>
    );
  }

  // 추천 모드: 기존 로직
  if (interestCategories.length === 0) {
    return null;
  }

  const view = resolveRecommendedView({
    selectedCategory: category,
    interestCategories,
    currentPage,
  });

  if (!view) {
    return null;
  }

  const renderHeader = (action?: ReactNode) => (
    <div className="flex items-center justify-between">
      <div className="gap-xs flex flex-col">
        <h2 className="text-text-primary text-2xl font-bold">{nickname}님을 위한 추천 세션</h2>
        <p className="text-text-disabled text-base">
          마이페이지에서 설정한 카테고리를 기반해서 방을 추천해드려요
        </p>
      </div>
      {action}
    </div>
  );

  switch (view.type) {
    case "carousel":
      return (
        <section className="gap-xl flex flex-col">
          {renderHeader(
            <PaginationFraction
              currentPage={currentPage}
              totalPage={totalPages}
              onPageChange={handlePageChange}
            />
          )}
          <RecommendedGrid category={view.category} />
        </section>
      );
    case "single":
      return (
        <section className="gap-xl flex flex-col">
          {renderHeader()}
          <RecommendedGrid category={view.category} />
        </section>
      );
    case "empty":
      return (
        <section className="gap-xl flex flex-col">
          {renderHeader()}
          <EmptyRecommendedSessionPlaceholder
            nickname={nickname}
            categoryLabel={getCategoryLabel(view.placeholderCategory)}
          />
        </section>
      );
    default:
      return null;
  }
}
