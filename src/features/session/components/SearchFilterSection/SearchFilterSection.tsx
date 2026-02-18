"use client";

import { useCallback } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { CategoryFilterButton } from "@/components/CategoryFilterButton/CategoryFilterButton";
import { SearchInput } from "@/components/SearchInput/SearchInput";

import type { SessionCategoryFilter } from "../../types";

/**
 * SearchFilterSection - 검색창 + 카테고리 필터
 *
 * 역할:
 * - URL searchParams 제어 (검색어, 카테고리)
 * - 사용자 입력 → URL 업데이트 → RecruitingSection 반응
 */

const CATEGORY_FILTERS: { value: SessionCategoryFilter; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "DEVELOPMENT", label: "개발" },
  { value: "DESIGN", label: "디자인" },
  { value: "PLANNING_PM", label: "기획 · PM" },
  { value: "CAREER_SELF_DEVELOPMENT", label: "커리어 · 자기계발" },
  { value: "STUDY_READING", label: "스터디 · 독서" },
  { value: "CREATIVE", label: "크리에이티브" },
  { value: "TEAM_PROJECT", label: "팀 프로젝트" },
  { value: "FREE", label: "자유" },
];

export function SearchFilterSection() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = (searchParams.get("category") as SessionCategoryFilter) ?? "ALL";
  const currentQuery = searchParams.get("q") ?? "";

  const updateSearchParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      // 필터 변경 시 페이지를 1로 리셋
      if (!("page" in updates)) {
        params.delete("page");
      }

      const queryString = params.toString();
      router.push(queryString ? `?${queryString}` : "/", { scroll: false });
    },
    [router, searchParams]
  );

  const handleSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const query = formData.get("q") as string;
      updateSearchParams({ q: query || null });
    },
    [updateSearchParams]
  );

  const handleCategoryChange = useCallback(
    (category: SessionCategoryFilter) => {
      updateSearchParams({
        category: category === "ALL" ? null : category,
      });
    },
    [updateSearchParams]
  );

  return (
    <section className="gap-lg flex flex-col items-center">
      <form onSubmit={handleSearch} className="flex w-full justify-center">
        <SearchInput
          name="q"
          defaultValue={currentQuery}
          placeholder="관심 있는 세션을 검색해 보세요"
        />
      </form>

      <div className="gap-xs flex flex-wrap justify-center">
        {CATEGORY_FILTERS.map(({ value, label }) => {
          const isSelected = currentCategory === value;
          return (
            <CategoryFilterButton
              key={value}
              isSelected={isSelected}
              onClick={() => handleCategoryChange(value)}
              // TODO(이경환): CategoryFilterButton 내부 구현 확인 후 className 적용 여부 결정 필요
              // 현재 CategoryFilterButton이 className prop을 받는지 확인 필요하지만,
              // 받지 않는다면 내부 로직 수정 필요.
              // 우선은 isSelected 일 때 Green Color 적용을 위해 CategoryFilterButton이
              // variant="solid" | "outline" 등을 지원하는지 확인해야 함.
              // 여기서는 일단 기존 로직 유지하되, 디자인 요구사항인
              // "전체 선택 시 Green text"는 CategoryFilterButton 내부에서 처리되거나
              // theme color 변경이 필요할 수 있음.
            >
              {label}
            </CategoryFilterButton>
          );
        })}
      </div>
    </section>
  );
}
