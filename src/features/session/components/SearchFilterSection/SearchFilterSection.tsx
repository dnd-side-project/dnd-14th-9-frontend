"use client";

import { useState, useRef, useEffect } from "react";

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

function updateScrollMask(el: HTMLDivElement | null) {
  if (!el) return;

  const canScrollLeft = el.scrollLeft > 1;
  const canScrollRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 1;

  if (canScrollLeft && canScrollRight) {
    el.style.maskImage =
      "linear-gradient(to right, transparent, black 40px, black calc(100% - 40px), transparent)";
  } else if (canScrollLeft) {
    el.style.maskImage = "linear-gradient(to right, transparent, black 40px)";
  } else if (canScrollRight) {
    el.style.maskImage = "linear-gradient(to right, black calc(100% - 40px), transparent)";
  } else {
    el.style.maskImage = "";
  }
}

export function SearchFilterSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parsedParams = parseSessionListSearchParams(searchParams);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(false);
  // 닫기 애니메이션(200ms) 동안 flex-wrap 유지 — 즉시 flex-nowrap 전환 시 콘텐츠가
  // 먼저 1행으로 리플로우되어 max-height 트랜지션이 시각적으로 사라지는 문제 방지
  const [displayExpanded, setDisplayExpanded] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    updateScrollMask(el);
    const handleScroll = () => updateScrollMask(el);
    el?.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      el?.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // 열릴 때: flex-wrap 즉시 적용 및 마스크 제거 / 닫힐 때: 애니메이션 후 flex-nowrap 전환 + 마스크 갱신
  useEffect(() => {
    const el = scrollRef.current;
    if (isCategoryExpanded) {
      if (el) el.style.maskImage = "";
      return;
    }

    if (el) el.scrollLeft = 0;
    const timer = setTimeout(() => {
      setDisplayExpanded(false);
      updateScrollMask(el);
    }, 200);
    return () => clearTimeout(timer);
  }, [isCategoryExpanded]);

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
    <section className="md:gap-xl gap-md flex w-full flex-col items-start md:items-center">
      <form onSubmit={handleSearch} className="flex w-full justify-center">
        <SearchInput
          ref={inputRef}
          name="q"
          defaultValue={currentQuery}
          placeholder="관심 분야의 세션을 검색해 보세요"
          onSearchClick={handleSearchClick}
        />
      </form>

      <div
        className={cn(
          "flex w-full md:justify-center",
          isCategoryExpanded ? "gap-sm items-start" : "gap-xs items-center"
        )}
      >
        {/* 높이 애니메이션 wrapper — mobile only */}
        <div
          className={cn(
            "min-w-0 flex-1 transition-[max-height] duration-200 ease-in-out",
            isCategoryExpanded
              ? "max-md:max-h-[139px] max-md:overflow-hidden"
              : "max-md:max-h-[41px] max-md:overflow-hidden"
          )}
        >
          <div
            ref={scrollRef}
            className={cn(
              "gap-xs md:gap-sm flex w-full flex-wrap items-center md:justify-center",
              "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              !displayExpanded && "max-md:flex-nowrap max-md:overflow-x-auto"
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
        </div>

        <button
          type="button"
          className={cn(
            "border-alpha-white-16 border-sm px-xs py-2xs hover:bg-surface-subtle rounded-max flex shrink-0 cursor-pointer items-center justify-center transition-colors md:hidden",
            isCategoryExpanded ? "bg-surface-strong" : "bg-surface-default"
          )}
          onClick={() => {
            const next = !isCategoryExpanded;
            setIsCategoryExpanded(next);
            if (next) setDisplayExpanded(true);
          }}
          aria-expanded={isCategoryExpanded}
          aria-label={isCategoryExpanded ? "카테고리 접기" : "카테고리 펼치기"}
        >
          <ChevronDownIcon
            className={cn(
              "transition-transform duration-300",
              isCategoryExpanded ? "rotate-180" : ""
            )}
          />
        </button>
      </div>
    </section>
  );
}
