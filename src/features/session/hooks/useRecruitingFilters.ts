"use client";

import { useCallback, useMemo } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import {
  DURATION_OPTIONS,
  getNextOptionValue,
  PARTICIPANTS_OPTIONS,
  SORT_OPTIONS,
} from "../components/RecruitingSection/recruitingFilter.types";
import { formatTimeSlotsParam, parseTimeSlotsParam } from "../utils/timeSlots";

import type { DurationRange, SessionSort, TimeSlot } from "../types";

export interface RecruitingFilterValues {
  startDate: string | null;
  endDate: string | null;
  timeSlots: TimeSlot[];
  durationRange: DurationRange | null;
  participants: string | null;
  sort: SessionSort;
}

type UpdateFiltersOptions = {
  resetPage?: boolean;
};

const DEFAULT_UPDATE_OPTIONS: Required<UpdateFiltersOptions> = {
  resetPage: true,
};

function isDurationRangeValue(value: string | null): value is DurationRange {
  return DURATION_OPTIONS.some((option) => option.value === value);
}

function isSessionSortValue(value: string | null): value is SessionSort {
  return SORT_OPTIONS.some((option) => option.value === value);
}

function formatDateParam(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function useRecruitingFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const values = useMemo<RecruitingFilterValues>(() => {
    const durationRangeParam = searchParams.get("durationRange");
    const sortParam = searchParams.get("sort");

    return {
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
      timeSlots: parseTimeSlotsParam(searchParams.get("timeSlots")),
      durationRange: isDurationRangeValue(durationRangeParam) ? durationRangeParam : null,
      participants: searchParams.get("participants"),
      sort: isSessionSortValue(sortParam) ? sortParam : "LATEST",
    };
  }, [searchParams]);

  const updateFilters = useCallback(
    (
      updates: Record<string, string | null>,
      options: UpdateFiltersOptions = DEFAULT_UPDATE_OPTIONS
    ) => {
      const mergedOptions = { ...DEFAULT_UPDATE_OPTIONS, ...options };
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      if (mergedOptions.resetPage) {
        params.delete("page");
      }

      const queryString = params.toString();
      router.push(queryString ? `?${queryString}` : "/", { scroll: false });
    },
    [router, searchParams]
  );

  const setDateRange = useCallback(
    (startDate: Date | null, endDate: Date | null) => {
      updateFilters({
        startDate: startDate ? formatDateParam(startDate) : null,
        endDate: endDate ? formatDateParam(endDate) : null,
      });
    },
    [updateFilters]
  );

  const toggleTimeSlot = useCallback(
    (timeSlot: TimeSlot) => {
      const selectedTimeSlotsSet = new Set<TimeSlot>(values.timeSlots);

      if (selectedTimeSlotsSet.has(timeSlot)) {
        selectedTimeSlotsSet.delete(timeSlot);
      } else {
        selectedTimeSlotsSet.add(timeSlot);
      }

      updateFilters({
        timeSlots: formatTimeSlotsParam(Array.from(selectedTimeSlotsSet)),
      });
    },
    [updateFilters, values.timeSlots]
  );

  const cycleDurationRange = useCallback(() => {
    updateFilters({
      durationRange: getNextOptionValue(DURATION_OPTIONS, values.durationRange),
    });
  }, [updateFilters, values.durationRange]);

  const cycleParticipants = useCallback(() => {
    updateFilters({
      participants: getNextOptionValue(PARTICIPANTS_OPTIONS, values.participants),
    });
  }, [updateFilters, values.participants]);

  const toggleSort = useCallback(() => {
    updateFilters({
      sort: values.sort === "LATEST" ? "POPULAR" : "LATEST",
    });
  }, [updateFilters, values.sort]);

  const setPage = useCallback(
    (page: number) => {
      updateFilters(
        {
          page: page === 1 ? null : String(page),
        },
        { resetPage: false }
      );
    },
    [updateFilters]
  );

  return {
    values,
    updateFilters,
    setDateRange,
    toggleTimeSlot,
    cycleDurationRange,
    cycleParticipants,
    toggleSort,
    setPage,
  };
}
