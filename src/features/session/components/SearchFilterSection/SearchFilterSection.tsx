"use client";

import { useState, useRef } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { CategoryFilterButton } from "@/components/CategoryFilterButton/CategoryFilterButton";
import { ChevronDownIcon } from "@/components/Icon/ChevronDownIcon";
import { SearchInput } from "@/components/SearchInput/SearchInput";
import { CATEGORIES, getCategoryLabel } from "@/lib/constants/category";
import { cn } from "@/lib/utils";

import { parseSessionListSearchParams } from "../../utils/parseSessionListSearchParams";
import { buildUpdatedSessionSearchHref } from "../../utils/updateSessionSearchParams";

import type { SessionCategoryFilter } from "../../types";

/**
 * SearchFilterSection - 검색창 + 카테고리 필터
 *
 * 역할:
 * - URL searchParams 제어 (검색어, 카테고리)
 * - 사용자 입력 → URL 업데이트 → SessionList 반응
 */

const CATEGORY_FILTERS: { value: SessionCategoryFilter; label: string }[] = [
  ...CATEGORIES.map((category) => ({
    value: category,
    label: getCategoryLabel(category),
  })),
];

export function SearchFilterSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parsedParams = parseSessionListSearchParams(searchParams);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(false);

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

  const handleSearchClick = () => {
    const query = inputRef.current?.value || "";
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
          ref={inputRef}
          name="q"
          defaultValue={currentQuery}
          placeholder="관심 분야의 세션을 검색해 보세요"
          onSearchClick={handleSearchClick}
          className="h-11 md:h-14"
        />
      </form>

      <div
        className={cn(
          "md:gap-xs flex w-full items-start md:justify-center",
          isCategoryExpanded ? "gap-sm" : "gap-xs"
        )}
      >
        <div
          className={cn(
            "gap-xs md:gap-sm flex min-w-0 flex-1 items-center md:flex-none md:justify-center",
            isCategoryExpanded
              ? "flex-wrap"
              : "min-h-[41px] flex-nowrap overflow-x-auto md:min-h-0 md:flex-wrap md:overflow-visible"
          )}
        >
          {CATEGORY_FILTERS.map(({ value, label }) => {
            const isSelected = currentCategory === value;
            return (
              <CategoryFilterButton
                key={value}
                isSelected={isSelected}
                onClick={() => handleCategoryChange(value)}
                className="text-xs md:text-sm"
              >
                {label}
              </CategoryFilterButton>
            );
          })}
        </div>

        <button
          type="button"
          className={cn(
            "border-alpha-white-16 border-sm p-xs rounded-max flex shrink-0 items-center justify-center md:hidden",
            isCategoryExpanded ? "bg-surface-strong" : "bg-surface-default"
          )}
          onClick={() => setIsCategoryExpanded((prev) => !prev)}
          aria-expanded={isCategoryExpanded}
          aria-label={isCategoryExpanded ? "카테고리 접기" : "카테고리 펼치기"}
        >
          <ChevronDownIcon
            className={cn("transition-transform", isCategoryExpanded ? "rotate-180" : "")}
          />
        </button>
      </div>
    </section>
  );
}
