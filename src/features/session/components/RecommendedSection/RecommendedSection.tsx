"use client";

import { useMemo } from "react";

import { PaginationFraction } from "@/components/Pagination/PaginationFraction";
import { useIsAuthenticated, useMeForEdit } from "@/features/member/hooks/useMemberHooks";
import { getMemberInterestCategoryLabel } from "@/types/shared/member-interest-category";
import type { MemberInterestCategory } from "@/types/shared/member-interest-category";

import { useRecommendedCarousel } from "../../hooks/useRecommendedCarousel";
import { useSessionList } from "../../hooks/useSessionHooks";
import { Card } from "../Card/Card";

/**
 * RecommendedSection - 맞춤 추천 세션
 *
 * 역할:
 * - 로그인 사용자에게만 표시 (조건부 렌더링)
 * - member/me/edit의 관심 카테고리 기반 추천
 * - firstInterestCategory → 1페이지 (4개)
 * - secondInterestCategory → 2페이지 (4개)
 * - thirdInterestCategory → 3페이지 (4개)
 */
export function RecommendedSection() {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return null;
  }

  return <RecommendedContent />;
}

function RecommendedContent() {
  const { data: editData } = useMeForEdit();

  const interestCategories = useMemo(() => {
    if (!editData?.result) return [];

    const categories: MemberInterestCategory[] = [];
    const { firstInterestCategory, secondInterestCategory, thirdInterestCategory } =
      editData.result;

    if (firstInterestCategory) categories.push(firstInterestCategory);
    if (secondInterestCategory) categories.push(secondInterestCategory);
    if (thirdInterestCategory) categories.push(thirdInterestCategory);

    return categories;
  }, [editData]);

  const { currentPage, totalPages, handlePageChange } = useRecommendedCarousel(
    interestCategories.length
  );

  const currentCategory = interestCategories[currentPage - 1];

  if (interestCategories.length === 0) {
    return null;
  }

  return (
    <section className="gap-xl flex flex-col">
      <div className="flex items-center justify-between">
        <div className="gap-xs flex flex-col">
          <h2 className="text-text-primary text-2xl font-bold">
            {editData?.result.nickname}님을 위한 추천 세션
          </h2>
          {currentCategory && (
            <p className="text-text-disabled text-base">
              마이페이지에서 설정한 카테고리를 기반해서 방을 추천해드려요
            </p>
          )}
        </div>

        <PaginationFraction
          currentPage={currentPage}
          totalPage={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {currentCategory && <RecommendedGrid category={currentCategory} />}
    </section>
  );
}

function RecommendedGrid({ category }: { category: MemberInterestCategory }) {
  const { data, isPending } = useSessionList({ category, size: 4 });
  const gridClassName = "gap-md grid min-h-[300px] grid-cols-4";

  if (isPending) {
    return (
      <div className={gridClassName}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface-strong aspect-[4/3] animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  const sessions = data?.result?.sessions ?? [];

  if (sessions.length === 0) {
    return (
      <div className={gridClassName}>
        <div className="text-text-muted col-span-4 flex items-center justify-center text-sm">
          해당 카테고리에 모집 중인 세션이 없습니다
        </div>
      </div>
    );
  }

  return (
    <div className={gridClassName}>
      {sessions.map((session) => (
        <Card
          key={session.title + session.startTime}
          thumbnailSrc={session.imageUrl}
          category={session.category}
          createdAt={session.startTime}
          title={session.title}
          nickname={session.hostNickname}
          currentParticipants={session.currentParticipants}
          maxParticipants={session.maxParticipants}
          durationMinutes={session.sessionDurationMinutes}
          sessionDate={session.startTime}
        />
      ))}
    </div>
  );
}
