"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { CategoryFilterButton } from "@/components/CategoryFilterButton/CategoryFilterButton";
import { SearchInput } from "@/components/SearchInput/SearchInput";

import { parseSessionListSearchParams } from "../../utils/parseSessionListSearchParams";
import { buildUpdatedSessionSearchHref } from "../../utils/updateSessionSearchParams";

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
  const parsedParams = parseSessionListSearchParams(searchParams);

  const currentCategory = parsedParams.category ?? "ALL";
  const currentQuery = parsedParams.keyword ?? "";

  const updateSearchParams = (updates: Record<string, string | null>) => {
    const href = buildUpdatedSessionSearchHref(searchParams, updates);
    router.push(href, { scroll: false });
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("q") as string;
    updateSearchParams({ q: query || null });
  };

  const handleCategoryChange = (category: SessionCategoryFilter) => {
    updateSearchParams({
      category: category === "ALL" ? null : category,
    });
  };

  return (
    <section className="gap-xl flex flex-col items-center">
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
            >
              {label}
            </CategoryFilterButton>
          );
        })}
      </div>
    </section>
  );
}
