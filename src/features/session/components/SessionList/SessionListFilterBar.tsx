"use client";

import { useState } from "react";

import { Button } from "@/components/Button/Button";
import type { DateRange } from "@/components/DatePicker/DatePicker.types";
import { ArrowRotateRightIcon } from "@/components/Icon/ArrowRotateRightIcon";

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
  onResetFilters: () => void;
}

type OpenFilterKey = "date" | "timeSlot" | "duration" | "participants" | "sort" | null;

export function SessionListFilterBar({
  values,
  onSetDateRange,
  onToggleTimeSlot,
  onSetDurationRange,
  onSetParticipants,
  onSetSort,
  onResetFilters,
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
  const hasTimeSlotSelection = values.timeSlots.length > 0;
  const hasDurationSelection = Boolean(values.durationRange);
  const hasParticipantsSelection = Boolean(values.participants);

  const hasAnyFilter =
    hasDateSelection || hasTimeSlotSelection || hasDurationSelection || hasParticipantsSelection;

  const handleDateRangeChange = (range: DateRange) => {
    onSetDateRange(range.startDate, range.endDate);
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
    <>
      {openFilter && openFilter !== "sort" && (
        <div className="bg-overlay-default fixed inset-0 z-10 w-full" />
      )}
      <div className="gap-md relative z-20 flex flex-col">
        <div className="flex items-center justify-end">
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
          <div
            className={`flex items-center overflow-hidden transition-all duration-300 ease-in-out ${
              hasAnyFilter ? "ml-xs max-w-[40px] opacity-100" : "ml-0 max-w-0 opacity-0"
            }`}
          >
            <Button
              size="small"
              variant="ghost"
              colorScheme="secondary"
              iconOnly
              leftIcon={<ArrowRotateRightIcon />}
              className="text-text-tertiary hover:text-text-primary active:bg-surface-strong active:text-text-primary h-[32px] w-[32px] shrink-0 p-[8px]!"
              onClick={onResetFilters}
            />
          </div>
        </div>

        <SortFilter
          isOpen={isSortOpen}
          value={values.sort}
          onOpenChange={handleSortOpenChange}
          onSelect={onSetSort}
          className="self-end"
        />
      </div>
    </>
  );
}
