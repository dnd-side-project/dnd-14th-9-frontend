"use client";

import type { ReactNode } from "react";

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
  const { category: selectedCategory } = parseSessionListSearchParams(searchParams);
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

  if (interestCategories.length === 0) {
    return null;
  }

  const view = resolveRecommendedView({
    selectedCategory,
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
