"use client";

import { useCallback, useMemo, useState } from "react";

import type { DateRange } from "@/components/DatePicker/DatePicker.types";
import { Filter } from "@/components/Filter/Filter";
import { cn } from "@/lib/utils/utils";

import { DateRangeFilter } from "./DateRangeFilter";
import {
  DURATION_OPTIONS,
  getOptionLabel,
  PARTICIPANTS_OPTIONS,
  SORT_OPTIONS,
} from "./recruitingFilter.types";
import { formatDateRangeFilterLabel, parseDateParam } from "./recruitingFilter.utils";
import { StartTimeFilter } from "./StartTimeFilter";

import type { RecruitingFilterValues } from "../../hooks/useRecruitingFilters";
import type { TimeSlot } from "../../types";

interface RecruitingFilterBarProps {
  values: RecruitingFilterValues;
  onSetDateRange: (startDate: Date | null, endDate: Date | null) => void;
  onToggleTimeSlot: (timeSlot: TimeSlot) => void;
  onCycleDurationRange: () => void;
  onCycleParticipants: () => void;
  onToggleSort: () => void;
}

type OpenFilterKey = "date" | "timeSlot" | null;

export function RecruitingFilterBar({
  values,
  onSetDateRange,
  onToggleTimeSlot,
  onCycleDurationRange,
  onCycleParticipants,
  onToggleSort,
}: RecruitingFilterBarProps) {
  const [openFilter, setOpenFilter] = useState<OpenFilterKey>(null);
  const isDatePickerOpen = openFilter === "date";
  const isTimeSlotOpen = openFilter === "timeSlot";

  const selectedDateRange = useMemo<DateRange>(
    () => ({
      startDate: parseDateParam(values.startDate),
      endDate: parseDateParam(values.endDate),
    }),
    [values.endDate, values.startDate]
  );

  const dateFilterLabel = formatDateRangeFilterLabel(selectedDateRange);
  const hasDateSelection = Boolean(selectedDateRange.startDate);

  const sortLabel = getOptionLabel(SORT_OPTIONS, values.sort, "정렬");
  const durationLabel = getOptionLabel(DURATION_OPTIONS, values.durationRange, "진행 시간");
  const participantsLabel = getOptionLabel(PARTICIPANTS_OPTIONS, values.participants, "인원");

  const handleDateRangeChange = useCallback(
    (range: DateRange) => {
      onSetDateRange(range.startDate, range.endDate);

      if (range.startDate && range.endDate) {
        setOpenFilter(null);
      }
    },
    [onSetDateRange]
  );

  const handleDateOpenChange = useCallback((isOpen: boolean) => {
    setOpenFilter(isOpen ? "date" : null);
  }, []);

  const handleTimeSlotOpenChange = useCallback((isOpen: boolean) => {
    setOpenFilter(isOpen ? "timeSlot" : null);
  }, []);

  return (
    <div className="gap-md flex flex-col">
      <div className="flex items-center gap-[15px]">
        <DateRangeFilter
          isOpen={isDatePickerOpen}
          label={dateFilterLabel}
          value={selectedDateRange}
          hasSelection={hasDateSelection}
          onOpenChange={handleDateOpenChange}
          onChange={handleDateRangeChange}
        />

        <StartTimeFilter
          isOpen={isTimeSlotOpen}
          selectedTimeSlots={values.timeSlots}
          onOpenChange={handleTimeSlotOpenChange}
          onToggleTimeSlot={onToggleTimeSlot}
        />

        <Filter
          size="large"
          radius="sm"
          onClick={onCycleDurationRange}
          className={cn("w-auto shrink-0", values.durationRange && "text-text-primary")}
        >
          {durationLabel}
        </Filter>

        <Filter
          size="large"
          radius="sm"
          onClick={onCycleParticipants}
          className={cn("w-auto shrink-0", values.participants && "text-text-primary")}
        >
          {participantsLabel}
        </Filter>
      </div>

      <Filter
        size="medium"
        radius="sm"
        bordered={false}
        onClick={onToggleSort}
        className="ml-auto min-w-[80px]"
      >
        {sortLabel}
      </Filter>
    </div>
  );
}
