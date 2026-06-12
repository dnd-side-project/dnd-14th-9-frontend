"use client";

import { useState } from "react";

import { Button } from "@/components/Button/Button";
import type { DateRange } from "@/components/DatePicker/DatePicker.types";
import { ArrowRotateRightIcon } from "@/components/Icon/ArrowRotateRightIcon";
import { BREAKPOINT_XL_PX } from "@/lib/constants/breakpoints";
import { cn } from "@/lib/utils/utils";

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
type SortFilterLayout = "nonDesktop" | "desktop";

// 모바일/태블릿에서 overflow-x-auto로 인해 필터 팝업이 잘리는 현상을 방지하기 위한 여백 확보 클래스입니다.
// 가장 높이가 높은 필터 패널(약 380px)을 기준으로 패딩을 주고, 음수 마진으로 레이아웃 흐름을 유지합니다.
const FILTER_PANEL_SPACE_CLASS = "-mb-[380px] pb-[380px] xl:mb-0 xl:pb-0";
// 필터바는 xl 미만에서 모바일/태블릿 UI가 동일하므로 nonDesktop(<xl)와 desktop(xl 이상)만 구분합니다.
const DESKTOP_SORT_MEDIA_QUERY = `(min-width: ${BREAKPOINT_XL_PX}px)`;

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
  const [openSortLayout, setOpenSortLayout] = useState<SortFilterLayout | null>(null);
  const isDatePickerOpen = openFilter === "date";
  const isTimeSlotOpen = openFilter === "timeSlot";
  const isDurationOpen = openFilter === "duration";
  const isParticipantsOpen = openFilter === "participants";
  const shouldReserveFilterPanelSpace = Boolean(openFilter);

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
    setOpenSortLayout(null);
    setOpenFilter(isOpen ? "date" : null);
  };

  const handleTimeSlotOpenChange = (isOpen: boolean) => {
    setOpenSortLayout(null);
    setOpenFilter(isOpen ? "timeSlot" : null);
  };

  const handleDurationOpenChange = (isOpen: boolean) => {
    setOpenSortLayout(null);
    setOpenFilter(isOpen ? "duration" : null);
  };

  const handleParticipantsOpenChange = (isOpen: boolean) => {
    setOpenSortLayout(null);
    setOpenFilter(isOpen ? "participants" : null);
  };

  const handleSortOpenChange = (isOpen: boolean, layout: SortFilterLayout) => {
    const isDesktopViewport = window.matchMedia?.(DESKTOP_SORT_MEDIA_QUERY).matches ?? false;

    if (
      (layout === "desktop" && !isDesktopViewport) ||
      (layout === "nonDesktop" && isDesktopViewport)
    ) {
      return;
    }

    setOpenSortLayout(isOpen ? layout : null);
    setOpenFilter(isOpen ? "sort" : null);
  };

  return (
    <>
      {openFilter && openFilter !== "sort" && (
        <div className="bg-overlay-default fixed inset-0 z-10 w-full" />
      )}
      <div className="gap-md relative z-20 flex flex-col xl:items-end">
        {/* 좁은 화면에서 필터 조작 공간을 확보하기 위해 정렬까지 같은 스크롤 영역에 둡니다. */}
        <div
          className={cn(
            "scrollbar-hide flex w-full items-center gap-[16px] overflow-x-auto xl:w-auto xl:overflow-visible",
            shouldReserveFilterPanelSpace && FILTER_PANEL_SPACE_CLASS
          )}
        >
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

          <SortFilter
            isOpen={openFilter === "sort" && openSortLayout === "nonDesktop"}
            value={values.sort}
            onOpenChange={(isOpen) => handleSortOpenChange(isOpen, "nonDesktop")}
            onSelect={onSetSort}
            className="ml-auto shrink-0 xl:hidden"
          />
        </div>

        <SortFilter
          isOpen={openFilter === "sort" && openSortLayout === "desktop"}
          value={values.sort}
          onOpenChange={(isOpen) => handleSortOpenChange(isOpen, "desktop")}
          onSelect={onSetSort}
          className="hidden shrink-0 xl:flex"
        />
      </div>
    </>
  );
}
