"use client";

import { useCallback, useMemo } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { SESSION_PARTICIPANTS_MAX, SESSION_PARTICIPANTS_MIN } from "../constants/sessionLimits";
import { parseSessionListSearchParams } from "../utils/parseSessionListSearchParams";
import { formatTimeSlotsParam } from "../utils/timeSlots";

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

function formatDateParam(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function clampParticipants(value: number) {
  return Math.min(SESSION_PARTICIPANTS_MAX, Math.max(SESSION_PARTICIPANTS_MIN, value));
}

export function useRecruitingFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const values = useMemo<RecruitingFilterValues>(() => {
    const parsedParams = parseSessionListSearchParams(searchParams);

    return {
      startDate: parsedParams.startDate ?? null,
      endDate: parsedParams.endDate ?? null,
      timeSlots: parsedParams.timeSlots,
      durationRange: parsedParams.durationRange ?? null,
      participants: parsedParams.participants ? String(parsedParams.participants) : null,
      sort: parsedParams.sort,
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

  const setDurationRange = useCallback(
    (durationRange: DurationRange) => {
      updateFilters({ durationRange });
    },
    [updateFilters]
  );

  const setParticipantsCount = useCallback(
    (participants: number) => {
      const nextParticipants = String(clampParticipants(Math.trunc(participants)));

      updateFilters({
        participants: nextParticipants,
      });
    },
    [updateFilters]
  );

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
    setDurationRange,
    setParticipantsCount,
    toggleSort,
    setPage,
  };
}
