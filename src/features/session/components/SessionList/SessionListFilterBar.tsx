"use client";

import { useState } from "react";

import type { DateRange } from "@/components/DatePicker/DatePicker.types";

import { DateRangeFilter } from "./DateRangeFilter";
import { DurationFilter } from "./DurationFilter";
import { ParticipantsFilter } from "./ParticipantsFilter";
import { formatDateRangeFilterLabel, parseDateParam } from "./sessionListFilter.utils";
import { SortFilter } from "./SortFilter";
import { StartTimeFilter } from "./StartTimeFilter";

import type { SessionListFilterValues } from "../../hooks/useSessionListFilters";
import type { DurationRange, SessionSort, TimeSlot } from "../../types";

interface SessionListFilterBarProps {
  values: SessionListFilterValues;
  onSetDateRange: (startDate: Date | null, endDate: Date | null) => void;
  onToggleTimeSlot: (timeSlot: TimeSlot) => void;
  onSetDurationRange: (durationRange: DurationRange) => void;
  onSetParticipants: (participants: number) => void;
  onSetSort: (sort: SessionSort) => void;
}

type OpenFilterKey = "date" | "timeSlot" | "duration" | "participants" | "sort" | null;

export function SessionListFilterBar({
  values,
  onSetDateRange,
  onToggleTimeSlot,
  onSetDurationRange,
  onSetParticipants,
  onSetSort,
}: SessionListFilterBarProps) {
  const [openFilter, setOpenFilter] = useState<OpenFilterKey>(null);
  const isDatePickerOpen = openFilter === "date";
  const isTimeSlotOpen = openFilter === "timeSlot";
  const isDurationOpen = openFilter === "duration";
  const isParticipantsOpen = openFilter === "participants";
  const isSortOpen = openFilter === "sort";

  const selectedDateRange: DateRange = {
    startDate: parseDateParam(values.startDate),
    endDate: parseDateParam(values.endDate),
  };

  const dateFilterLabel = formatDateRangeFilterLabel(selectedDateRange);
  const hasDateSelection = Boolean(selectedDateRange.startDate);

  const handleDateRangeChange = (range: DateRange) => {
    onSetDateRange(range.startDate, range.endDate);

    if (range.startDate && range.endDate) {
      setOpenFilter(null);
    }
  };

  const handleDateOpenChange = (isOpen: boolean) => {
    setOpenFilter(isOpen ? "date" : null);
  };

  const handleTimeSlotOpenChange = (isOpen: boolean) => {
    setOpenFilter(isOpen ? "timeSlot" : null);
  };

  const handleDurationOpenChange = (isOpen: boolean) => {
    setOpenFilter(isOpen ? "duration" : null);
  };

  const handleParticipantsOpenChange = (isOpen: boolean) => {
    setOpenFilter(isOpen ? "participants" : null);
  };

  const handleSortOpenChange = (isOpen: boolean) => {
    setOpenFilter(isOpen ? "sort" : null);
  };

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

        <DurationFilter
          isOpen={isDurationOpen}
          value={values.durationRange}
          onOpenChange={handleDurationOpenChange}
          onSelect={onSetDurationRange}
        />

        <ParticipantsFilter
          isOpen={isParticipantsOpen}
          participants={values.participants}
          onOpenChange={handleParticipantsOpenChange}
          onChange={onSetParticipants}
        />
      </div>

      <SortFilter
        isOpen={isSortOpen}
        value={values.sort}
        onOpenChange={handleSortOpenChange}
        onSelect={onSetSort}
        className="self-end"
      />
    </div>
  );
}
