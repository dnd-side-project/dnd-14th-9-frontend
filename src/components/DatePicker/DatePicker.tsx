import { forwardRef } from "react";

import { CalendarIcon } from "@/components/Icon/CalendarIcon";
import { ChevronDownIcon } from "@/components/Icon/ChevronDownIcon";
import { cn } from "@/lib/utils/utils";

import { useDatePicker } from "./useDatePicker";

import type { DatePickerProps } from "./DatePicker.types";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  ({ value, defaultValue, onChange, disabled, className }, ref) => {
    const {
      displayYearMonth,
      todayYearMonth,
      calendarDays,
      goToPrevMonth,
      goToNextMonth,
      handleDateClick,
    } = useDatePicker({ value, defaultValue, onChange });

    return (
      <div
        ref={ref}
        className={cn(
          "border-border-subtle h-[345px] w-[356px] rounded-md border p-4",
          disabled && "pointer-events-none opacity-50",
          className
        )}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          {/* Month Navigation */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goToPrevMonth}
              className="text-text-disabled hover:text-text-secondary transition-colors"
              aria-label="이전 달"
            >
              <ChevronDownIcon size="small" className="rotate-90" />
            </button>
            <span className="text-text-secondary text-[18px] font-semibold">
              {displayYearMonth}
            </span>
            <button
              type="button"
              onClick={goToNextMonth}
              className="text-text-disabled hover:text-text-secondary transition-colors"
              aria-label="다음 달"
            >
              <ChevronDownIcon size="small" className="-rotate-90" />
            </button>
          </div>

          {/* Today Display */}
          <div className="text-text-disabled flex items-center gap-1 text-[13px]">
            <CalendarIcon size="xsmall" />
            <span>{todayYearMonth}</span>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="mb-2 grid grid-cols-7">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="text-text-secondary py-2 text-center text-[15px] font-semibold"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => (
            <button
              key={index}
              type="button"
              disabled={day.isDisabled || !day.date}
              onClick={() => day.date && handleDateClick(day.date)}
              className={cn(
                "flex h-10 items-center justify-center text-[15px] transition-colors",
                // Base state
                !day.date && "cursor-default",
                day.date && !day.isDisabled && "hover:bg-alpha-white-8 cursor-pointer",
                // Text colors
                day.isDisabled && "text-text-disabled cursor-not-allowed",
                !day.isDisabled && !day.isSelected && "text-text-secondary",
                // Today
                day.isToday && !day.isSelected && "bg-alpha-white-16 rounded-sm",
                // Selected (start or end)
                day.isSelected &&
                  "text-text-brand-default rounded-sm bg-green-500/10 font-semibold",
                // In range (between start and end)
                day.isInRange && "bg-alpha-white-8 rounded-sm"
              )}
            >
              {day.date ? day.dayOfMonth : ""}
            </button>
          ))}
        </div>
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";
