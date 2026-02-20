"use client";

import { useMemo } from "react";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { PaginationFraction } from "@/components/Pagination/PaginationFraction";
import { useIsAuthenticated, useSuspenseMeForEdit } from "@/features/member/hooks/useMemberHooks";
import { parseSessionListSearchParams } from "@/features/session/utils/parseSessionListSearchParams";
import { getCategoryLabel } from "@/lib/constants/category";
import type { Category } from "@/lib/constants/category";

import { useRecommendedCarousel } from "../../hooks/useRecommendedCarousel";
import { useSuspenseSessionList } from "../../hooks/useSessionHooks";
import { Card } from "../Card/Card";

import { EmptyRecommendedSessionPlaceholder } from "./EmptyRecommendedSessionPlaceholder";

/**
 * RecommendedSection - 맞춤 추천 세션
 *
 * 역할:
 * - 로그인 사용자에게만 표시 (조건부 렌더링)
 * - member/me/edit의 관심 카테고리 기반 추천
 * - category 쿼리 파라미터가 "ALL" 이거나 없을 때:
 *   - firstInterestCategory → 1페이지 (4개)
 *   - secondInterestCategory → 2페이지 (4개)
 *   - thirdInterestCategory → 3페이지 (4개)
 * - category 파라미터가 지정될 때:
 *   - 관심 카테고리인 경우: 해당 카테고리 카드 노출 (페이지네이션 없음)
 *   - 관심 카테고리가 아닌 경우: EmptyRecommendedSessionPlaceholder 노출
 */
export function RecommendedSection() {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return null;
  }

  return <RecommendedContent />;
}

function RecommendedContent() {
  const searchParams = useSearchParams();
  const parsedParams = parseSessionListSearchParams(searchParams);
  const selectedCategory = parsedParams.category;

  const { data: editData } = useSuspenseMeForEdit();

  const interestCategories = useMemo(() => {
    if (!editData?.result) return [];

    const categories: Category[] = [];
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

  if (interestCategories.length === 0) {
    return null;
  }

  // 검색 카테고리가 "ALL"이거나 지정되지 않은 경우
  const isAllCategorySelected = !selectedCategory || selectedCategory === "ALL";

  // 검색 카테고리가 사용자의 관심 카테고리에 포함되는지 여부
  const isInterestCategorySelected =
    !isAllCategorySelected && interestCategories.includes(selectedCategory as Category);

  // 1. ALL 이거나 미지정 시: 기존 페이지네이션 (현재 순위 카테고리 노출)
  if (isAllCategorySelected) {
    const currentCategory = interestCategories[currentPage - 1];

    if (!currentCategory) return null;

    return (
      <section className="gap-xl flex flex-col">
        <div className="flex items-center justify-between">
          <div className="gap-xs flex flex-col">
            <h2 className="text-text-primary text-2xl font-bold">
              {editData?.result.nickname}님을 위한 추천 세션
            </h2>
            <p className="text-text-disabled text-base">
              마이페이지에서 설정한 카테고리를 기반해서 방을 추천해드려요
            </p>
          </div>

          <PaginationFraction
            currentPage={currentPage}
            totalPage={totalPages}
            onPageChange={handlePageChange}
          />
        </div>

        <RecommendedGrid category={currentCategory} />
      </section>
    );
  }

  // 2. 검색 카테고리가 관심 카테고리에 포함되는 경우: 해당 카테고리 카드 4개만 노출 (페이지네이션 숨김)
  if (isInterestCategorySelected) {
    return (
      <section className="gap-xl flex flex-col">
        <div className="flex items-center justify-between">
          <div className="gap-xs flex flex-col">
            <h2 className="text-text-primary text-2xl font-bold">
              {editData?.result.nickname}님을 위한 추천 세션
            </h2>
            <p className="text-text-disabled text-base">
              마이페이지에서 설정한 카테고리를 기반해서 방을 추천해드려요
            </p>
          </div>
        </div>

        <RecommendedGrid category={selectedCategory as Category} />
      </section>
    );
  }

  // 3. 검색 카테고리가 관심 카테고리가 아닌 경우: 빈 화면 컴포넌트 노출
  return (
    <section className="gap-xl flex flex-col">
      <div className="flex items-center justify-between">
        <div className="gap-xs flex flex-col">
          <h2 className="text-text-primary text-2xl font-bold">
            {editData?.result.nickname}님을 위한 추천 세션
          </h2>
          <p className="text-text-disabled text-base">
            마이페이지에서 설정한 카테고리를 기반해서 방을 추천해드려요
          </p>
        </div>
      </div>
      <EmptyRecommendedSessionPlaceholder
        nickname={editData?.result.nickname ?? ""}
        categoryLabel={getCategoryLabel(selectedCategory)}
      />
    </section>
  );
}

function RecommendedGrid({ category }: { category: Category }) {
  const { data } = useSuspenseSessionList({ category, size: 4 });
  const gridClassName = "gap-md grid min-h-[300px] grid-cols-4";
  const sessions = data.result.sessions;

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
        <Link key={session.sessionId} href={`/session/${session.sessionId}`}>
          <Card
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
        </Link>
      ))}
    </div>
  );
}
