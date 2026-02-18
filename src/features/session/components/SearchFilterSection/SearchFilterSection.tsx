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
    <section className="gap-lg flex flex-col">
      <form onSubmit={handleSearch}>
        <SearchInput
          name="q"
          defaultValue={currentQuery}
          placeholder="관심 있는 세션을 검색해 보세요"
        />
      </form>

      <div className="gap-xs flex flex-wrap">
        {CATEGORY_FILTERS.map(({ value, label }) => (
          <CategoryFilterButton
            key={value}
            isSelected={currentCategory === value}
            onClick={() => handleCategoryChange(value)}
          >
            {label}
          </CategoryFilterButton>
        ))}
      </div>
    </section>
  );
}
