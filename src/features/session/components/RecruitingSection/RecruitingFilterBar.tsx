"use client";

import { Dropdown } from "@/components/Dropdown/Dropdown";

import type { SessionSort } from "../../types";

/**
 * RecruitingFilterBar - 모집 중 세션 정렬 드롭다운
 *
 * URL searchParams의 sort 파라미터로 정렬 기준을 제어합니다.
 */

const SORT_OPTIONS: { value: SessionSort; label: string }[] = [
  { value: "LATEST", label: "최신순" },
  { value: "POPULAR", label: "인기순" },
];

interface RecruitingFilterBarProps {
  sort: SessionSort;
  onSortChange: (sort: string) => void;
}

export function RecruitingFilterBar({ sort, onSortChange }: RecruitingFilterBarProps) {
  return (
    <div className="gap-sm flex items-center">
      <Dropdown
        options={SORT_OPTIONS}
        value={sort}
        onChange={onSortChange}
        placeholder="정렬"
        size="large"
      />
    </div>
  );
}
