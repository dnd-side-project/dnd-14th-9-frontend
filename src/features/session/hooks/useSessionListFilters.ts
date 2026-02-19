"use client";

import { useCallback } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { SESSION_PARTICIPANTS_MAX, SESSION_PARTICIPANTS_MIN } from "../constants/sessionLimits";
import { parseSessionListSearchParams } from "../utils/parseSessionListSearchParams";
import { formatTimeSlotsParam } from "../utils/timeSlots";
import {
  buildUpdatedSessionSearchHref,
  type SessionSearchParamUpdates,
} from "../utils/updateSessionSearchParams";

import type { DurationRange, SessionSort, TimeSlot } from "../types";

export interface SessionListFilterValues {
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

export function useSessionListFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parsedParams = parseSessionListSearchParams(searchParams);

  const values: SessionListFilterValues = {
    startDate: parsedParams.startDate ?? null,
    endDate: parsedParams.endDate ?? null,
    timeSlots: parsedParams.timeSlots,
    durationRange: parsedParams.durationRange ?? null,
    participants: parsedParams.participants ? String(parsedParams.participants) : null,
    sort: parsedParams.sort,
  };

  const updateFilters = useCallback(
    (
      updates: SessionSearchParamUpdates,
      options: UpdateFiltersOptions = DEFAULT_UPDATE_OPTIONS
    ) => {
      const href = buildUpdatedSessionSearchHref(searchParams, updates, {
        resetPage: options.resetPage,
      });
      router.push(href, { scroll: false });
    },
    [router, searchParams]
  );

  const setDateRange = (startDate: Date | null, endDate: Date | null) => {
    updateFilters({
      startDate: startDate ? formatDateParam(startDate) : null,
      endDate: endDate ? formatDateParam(endDate) : null,
    });
  };

  const toggleTimeSlot = (timeSlot: TimeSlot) => {
    const selectedTimeSlotsSet = new Set<TimeSlot>(values.timeSlots);

    if (selectedTimeSlotsSet.has(timeSlot)) {
      selectedTimeSlotsSet.delete(timeSlot);
    } else {
      selectedTimeSlotsSet.add(timeSlot);
    }

    updateFilters({
      timeSlots: formatTimeSlotsParam(Array.from(selectedTimeSlotsSet)),
    });
  };

  const setDurationRange = (durationRange: DurationRange) => {
    updateFilters({ durationRange });
  };

  const setParticipantsCount = (participants: number) => {
    const nextParticipants = String(clampParticipants(Math.trunc(participants)));

    updateFilters({
      participants: nextParticipants,
    });
  };

  const toggleSort = () => {
    updateFilters({
      sort: values.sort === "LATEST" ? "POPULAR" : "LATEST",
    });
  };

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
