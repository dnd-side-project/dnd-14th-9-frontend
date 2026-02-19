import { CATEGORIES } from "@/lib/constants/category";

import {
  DURATION_OPTIONS,
  SORT_OPTIONS,
} from "../components/RecruitingSection/recruitingFilter.types";
import { parseParticipantsFilterValue } from "../components/RecruitingSection/recruitingFilter.utils";

import { parsePageParam } from "./pagination";
import { parseTimeSlotsParam } from "./timeSlots";

import type { DurationRange, SessionCategoryFilter, SessionSort } from "../types";

export type SessionListPageSearchParams = Record<string, string | string[] | undefined>;
type SearchParamsReader = Pick<URLSearchParams, "get">;

const SESSION_CATEGORY_FILTER_VALUES = CATEGORIES;

function isSessionSortValue(value: string | undefined): value is SessionSort {
  if (!value) return false;
  return SORT_OPTIONS.some((option) => option.value === value);
}

function isDurationRangeValue(value: string | undefined): value is DurationRange {
  if (!value) return false;
  return DURATION_OPTIONS.some((option) => option.value === value);
}

function isSessionCategoryFilterValue(value: string | undefined): value is SessionCategoryFilter {
  if (!value) return false;
  return SESSION_CATEGORY_FILTER_VALUES.includes(value as SessionCategoryFilter);
}

export interface ParsedSessionListSearchParams {
  keyword?: string;
  category?: SessionCategoryFilter;
  sort: SessionSort;
  startDate?: string;
  endDate?: string;
  durationRange?: DurationRange;
  timeSlots: ReturnType<typeof parseTimeSlotsParam>;
  participants?: number;
  page: number;
}

export function toURLSearchParams(params: SessionListPageSearchParams): URLSearchParams {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") {
      searchParams.set(key, value);
      continue;
    }

    if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
      searchParams.set(key, value[0]);
    }
  }

  return searchParams;
}

function getParam(searchParams: SearchParamsReader, key: string) {
  return searchParams.get(key) ?? undefined;
}

export function parseSessionListSearchParams(
  searchParams: SearchParamsReader
): ParsedSessionListSearchParams {
  const keyword = getParam(searchParams, "q");
  const categoryParam = getParam(searchParams, "category");
  const sortParam = getParam(searchParams, "sort");
  const durationRangeParam = getParam(searchParams, "durationRange");
  const participantsParam = parseParticipantsFilterValue(
    getParam(searchParams, "participants") ?? null
  );

  return {
    keyword,
    category: isSessionCategoryFilterValue(categoryParam) ? categoryParam : undefined,
    sort: isSessionSortValue(sortParam) ? sortParam : "LATEST",
    startDate: getParam(searchParams, "startDate"),
    endDate: getParam(searchParams, "endDate"),
    durationRange: isDurationRangeValue(durationRangeParam) ? durationRangeParam : undefined,
    timeSlots: parseTimeSlotsParam(getParam(searchParams, "timeSlots") ?? null),
    participants: participantsParam ? Number(participantsParam) : undefined,
    page: parsePageParam(getParam(searchParams, "page")),
  };
}
