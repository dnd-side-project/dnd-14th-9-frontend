"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import { useSearchParams, useRouter } from "next/navigation";

import { DatePicker } from "@/components/DatePicker/DatePicker";
import type { DateRange } from "@/components/DatePicker/DatePicker.types";
import { Filter } from "@/components/Filter/Filter";
import { CheckIcon } from "@/components/Icon/CheckIcon";
import { useClickOutside } from "@/hooks/useClickOutside";
import { formatDateRangeDisplay, getKoreanDayOfWeek } from "@/lib/utils/date";
import { cn } from "@/lib/utils/utils";

import {
  formatTimeSlotsParam,
  parseTimeSlotsParam,
  TIME_SLOT_OPTIONS,
} from "../../utils/timeSlots";

import type { SessionSort, TimeSlot } from "../../types";

/**
 * RecruitingFilterBar - 모집 중 세션 필터링 및 정렬
 *
 * 역할:
 * - 시작 날짜, 시간대, 진행 시간, 인원 필터링
 * - 정렬 (최신순/인기순)
 * - URL searchParams와 동기화
 */

type FilterOption = {
  value: string;
  label: string;
};

const SORT_OPTIONS: FilterOption[] = [
  { value: "LATEST", label: "최신순" },
  { value: "POPULAR", label: "인기순" },
];

const DURATION_OPTIONS: FilterOption[] = [
  { value: "HALF_TO_ONE_HOUR", label: "30분 ~ 1시간" },
  { value: "TWO_TO_FOUR_HOURS", label: "2시간 ~ 4시간" },
  { value: "FIVE_TO_EIGHT_HOURS", label: "5시간 ~ 8시간" },
  { value: "TEN_PLUS_HOURS", label: "10시간 이상" },
];

// 임시 인원 옵션
const PARTICIPANTS_OPTIONS: FilterOption[] = [
  { value: "3", label: "3명 이하" },
  { value: "5", label: "5명 이하" },
  { value: "10", label: "10명 이하" },
];

function getOptionLabel(options: FilterOption[], value: string | null, placeholder: string) {
  return options.find((option) => option.value === value)?.label ?? placeholder;
}

function getNextOptionValue(options: FilterOption[], currentValue: string | null) {
  if (options.length === 0) return null;
  if (!currentValue) return options[0].value;

  const currentIndex = options.findIndex((option) => option.value === currentValue);
  if (currentIndex === -1) return options[0].value;

  const nextIndex = currentIndex + 1;
  return nextIndex < options.length ? options[nextIndex].value : null;
}

function parseDateParam(value: string | null) {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;

  const parsed = new Date(year, month - 1, day);
  if (Number.isNaN(parsed.getTime())) return null;

  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

function formatDateParam(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatSingleDateLabel(date: Date) {
  const year = String(date.getFullYear()).slice(2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dayOfWeek = getKoreanDayOfWeek(date);
  return `${year}.${month}.${day}(${dayOfWeek})`;
}

function formatDateRangeFilterLabel(range: DateRange) {
  if (!range.startDate) return "시작 날짜";
  if (!range.endDate) return formatSingleDateLabel(range.startDate);

  return formatDateRangeDisplay(range.startDate, range.endDate).replaceAll("/", ".");
}

function getTimeSlotFilterLabel(selectedTimeSlots: TimeSlot[]) {
  if (selectedTimeSlots.length === 0) return "시작 시간대";

  const selectedLabels = TIME_SLOT_OPTIONS.filter((option) =>
    selectedTimeSlots.includes(option.value)
  ).map((option) => option.triggerLabel);

  if (selectedLabels.length <= 1) {
    return selectedLabels[0] ?? "시작 시간대";
  }

  return `${selectedLabels[0]} 외 ${selectedLabels.length - 1}`;
}

interface RecruitingFilterBarProps {
  sort: SessionSort;
  onSortChange: (sort: string) => void;
}

export function RecruitingFilterBar({ sort, onSortChange }: RecruitingFilterBarProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isTimeSlotOpen, setIsTimeSlotOpen] = useState(false);
  const datePickerContainerRef = useRef<HTMLDivElement>(null);
  const timeSlotContainerRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  // URL에서 현재 필터 값 가져오기
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");
  const timeSlotsParam = searchParams.get("timeSlots");
  const duration = searchParams.get("durationRange");
  const participants = searchParams.get("participants");
  const selectedTimeSlots = useMemo(() => parseTimeSlotsParam(timeSlotsParam), [timeSlotsParam]);

  const selectedDateRange = useMemo<DateRange>(
    () => ({
      startDate: parseDateParam(startDateParam),
      endDate: parseDateParam(endDateParam),
    }),
    [startDateParam, endDateParam]
  );
  const dateFilterLabel = formatDateRangeFilterLabel(selectedDateRange);
  const hasDateSelection = Boolean(selectedDateRange.startDate);
  const hasTimeSlotSelection = selectedTimeSlots.length > 0;

  const sortLabel = getOptionLabel(SORT_OPTIONS, sort, "정렬");
  const timeSlotLabel = getTimeSlotFilterLabel(selectedTimeSlots);
  const durationLabel = getOptionLabel(DURATION_OPTIONS, duration, "진행 시간");
  const participantsLabel = getOptionLabel(PARTICIPANTS_OPTIONS, participants, "인원");

  const updateFilters = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }

      params.delete("page");
      const queryString = params.toString();
      router.push(queryString ? `?${queryString}` : "/", { scroll: false });
    },
    [router, searchParams]
  );

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      updateFilters({ [key]: value });
    },
    [updateFilters]
  );

  const handleDateRangeChange = useCallback(
    (range: DateRange) => {
      updateFilters({
        startDate: range.startDate ? formatDateParam(range.startDate) : null,
        endDate: range.endDate ? formatDateParam(range.endDate) : null,
      });

      if (range.startDate && range.endDate) {
        setIsDatePickerOpen(false);
      }
    },
    [updateFilters]
  );

  const toggleTimeSlot = useCallback(
    (timeSlot: TimeSlot) => {
      const selectedTimeSlotsSet = new Set<TimeSlot>(selectedTimeSlots);

      if (selectedTimeSlotsSet.has(timeSlot)) {
        selectedTimeSlotsSet.delete(timeSlot);
      } else {
        selectedTimeSlotsSet.add(timeSlot);
      }

      updateFilter("timeSlots", formatTimeSlotsParam(Array.from(selectedTimeSlotsSet)));
    },
    [selectedTimeSlots, updateFilter]
  );

  const closeDatePicker = useCallback(() => setIsDatePickerOpen(false), []);
  const closeTimeSlot = useCallback(() => setIsTimeSlotOpen(false), []);
  useClickOutside(datePickerContainerRef, closeDatePicker, isDatePickerOpen);
  useClickOutside(timeSlotContainerRef, closeTimeSlot, isTimeSlotOpen);

  return (
    <div className="gap-md flex flex-col">
      {/* 좌측 필터 그룹 -> items-start로 변경하여 왼쪽 정렬 */}
      <div className="flex items-center gap-[15px]">
        <div ref={datePickerContainerRef} className="relative shrink-0">
          <Filter
            size="large"
            radius="sm"
            isOpen={isDatePickerOpen}
            onClick={() => {
              setIsDatePickerOpen((prev) => !prev);
              setIsTimeSlotOpen(false);
            }}
            className={cn(
              "w-auto max-w-[280px] shrink-0",
              hasDateSelection && "text-text-primary",
              isDatePickerOpen && ["border-text-brand-default", "shadow-[0_0_8px_0_#27EA674D]"]
            )}
          >
            {dateFilterLabel}
          </Filter>

          {isDatePickerOpen && (
            <div className="absolute top-full left-0 z-20 mt-3">
              <DatePicker
                mode="range"
                value={selectedDateRange}
                onChange={handleDateRangeChange}
                className="bg-surface-strong"
              />
            </div>
          )}
        </div>

        {/* 시작 시간대 */}
        <div ref={timeSlotContainerRef} className="relative shrink-0">
          <Filter
            size="large"
            radius="sm"
            isOpen={isTimeSlotOpen}
            aria-haspopup="dialog"
            onClick={() => {
              setIsTimeSlotOpen((prev) => !prev);
              setIsDatePickerOpen(false);
            }}
            className={cn(
              "w-auto shrink-0",
              hasTimeSlotSelection && "text-text-primary",
              isTimeSlotOpen && ["border-text-brand-default", "shadow-[0_0_8px_0_#27EA674D]"]
            )}
          >
            {timeSlotLabel}
          </Filter>

          {isTimeSlotOpen && (
            <div
              role="dialog"
              aria-label="시작 시간대 선택"
              className="p-xl absolute top-full left-0 z-20 mt-3 w-[256px] rounded-sm border border-gray-900 bg-gray-950"
            >
              <div className="flex flex-col gap-[20px]">
                <p className="text-[16px] leading-[1.4] font-semibold text-gray-300">시작 시간대</p>
                <ul className="gap-md flex flex-col">
                  {TIME_SLOT_OPTIONS.map((option) => {
                    const isSelected = selectedTimeSlots.includes(option.value);

                    return (
                      <li key={option.value} className="w-full">
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={isSelected}
                          onClick={() => toggleTimeSlot(option.value)}
                          className="focus-visible:ring-primary text-text-secondary hover:text-text-primary gap-2xs flex w-full items-center rounded-[4px] text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
                        >
                          <span
                            className={cn(
                              "flex h-5 w-5 items-center justify-center rounded-[4px] border",
                              isSelected
                                ? "border-[#007E4E] bg-[#003A23] text-[#27EA67]"
                                : "border-gray-600 bg-transparent text-transparent"
                            )}
                          >
                            <CheckIcon size="xsmall" />
                          </span>
                          <span className="text-[15px] leading-[1.4]">{option.panelLabel}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* 진행 시간 */}
        <Filter
          size="large"
          radius="sm"
          onClick={() =>
            updateFilter("durationRange", getNextOptionValue(DURATION_OPTIONS, duration))
          }
          className={cn("w-auto shrink-0", duration && "text-text-primary")}
        >
          {durationLabel}
        </Filter>

        {/* 인원 */}
        <Filter
          size="large"
          radius="sm"
          onClick={() =>
            updateFilter("participants", getNextOptionValue(PARTICIPANTS_OPTIONS, participants))
          }
          className={cn("w-auto shrink-0", participants && "text-text-primary")}
        >
          {participantsLabel}
        </Filter>
      </div>

      {/* 우측 정렬 (Sort) */}
      <Filter
        size="medium"
        radius="sm"
        bordered={false}
        onClick={() => onSortChange(sort === "LATEST" ? "POPULAR" : "LATEST")}
        className="ml-auto min-w-[80px]"
      >
        {sortLabel}
      </Filter>
    </div>
  );
}
