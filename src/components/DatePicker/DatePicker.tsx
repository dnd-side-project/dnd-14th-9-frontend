"use client";

import { forwardRef, useState, useCallback } from "react";

import { CalendarIcon } from "@/components/Icon/CalendarIcon";
import { ChevronDownIcon } from "@/components/Icon/ChevronDownIcon";
import { cn } from "@/lib/utils/utils";

import { TimePickerPanel } from "./TimePickerPanel";
import { useDatePicker, useDatePickerSingle } from "./useDatePicker";

import type {
  DatePickerProps,
  DatePickerRangeProps,
  DatePickerSingleProps,
} from "./DatePicker.types";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function isRangeProps(props: DatePickerProps): props is DatePickerRangeProps {
  return props.mode !== "single";
}

const DatePickerRange = forwardRef<HTMLDivElement, DatePickerRangeProps>(
  ({ value, defaultValue, onChange, disabled, className }, ref) => {
    const {
      displayYearMonth,
      displayText,
      calendarDays,
      goToPrevMonth,
      goToNextMonth,
      handleDateClick,
    } = useDatePicker({ value, defaultValue, onChange });

    return (
      <div
        ref={ref}
        className={cn(
          "border-border-subtle flex min-h-[345px] w-[356px] flex-col rounded-md border p-4",
          disabled && "pointer-events-none opacity-50",
          className
        )}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-text-secondary text-[18px] font-semibold">
              {displayYearMonth}
            </span>
            <div className="text-text-disabled flex items-center gap-1 text-[13px]">
              <CalendarIcon size="xsmall" />
              <span>{displayText}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={goToPrevMonth}
              className="text-text-disabled hover:text-text-secondary transition-colors"
              aria-label="이전 달"
            >
              <ChevronDownIcon size="small" className="rotate-90" />
            </button>
            <button
              type="button"
              onClick={goToNextMonth}
              className="text-text-disabled hover:text-text-secondary transition-colors"
              aria-label="다음 달"
            >
              <ChevronDownIcon size="small" className="-rotate-90" />
            </button>
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
        <div className="grid flex-1 grid-cols-7">
          {calendarDays.map((day, index) => (
            <button
              key={day.date ? day.date.toISOString() : `empty-${index}`}
              type="button"
              disabled={day.isDisabled || !day.date}
              onClick={() => day.date && handleDateClick(day.date)}
              className={cn(
                "flex h-11 w-full items-center justify-center text-[15px] transition-colors",
                !day.date && "cursor-default",
                day.date && !day.isDisabled && "hover:bg-alpha-white-8 cursor-pointer",
                day.isDisabled && "text-text-disabled cursor-not-allowed",
                !day.isDisabled && !day.isSelected && "text-text-secondary",
                day.isToday && !day.isSelected && !day.isInRange && "bg-alpha-white-16 rounded-sm",
                day.isInRange && "bg-alpha-white-8",
                day.isRangeStart && "rounded-l-sm",
                day.isRangeEnd && "rounded-r-sm"
              )}
            >
              {day.date ? (
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center",
                    day.isSelected &&
                      "text-text-brand-default rounded-sm bg-green-500/10 font-semibold"
                  )}
                >
                  {day.dayOfMonth}
                </span>
              ) : (
                ""
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }
);

DatePickerRange.displayName = "DatePickerRange";

const DatePickerSingle = forwardRef<HTMLDivElement, DatePickerSingleProps>(
  ({ value, defaultValue, onChange, disabled, className, showTimePicker }, ref) => {
    const [hour, setHour] = useState(() => (value ? value.getHours() : new Date().getHours()));
    const [minute, setMinute] = useState(() => {
      const mins = value ? value.getMinutes() : new Date().getMinutes();
      return Math.floor(mins / 5) * 5;
    });

    const {
      displayYearMonth,
      displayText,
      calendarDays,
      selectedDate,
      goToPrevMonth,
      goToNextMonth,
      handleDateClick: baseHandleDateClick,
    } = useDatePickerSingle({ value, defaultValue, onChange });

    const handleDateClick = useCallback(
      (date: Date) => {
        if (showTimePicker) {
          const newDate = new Date(date);
          newDate.setHours(hour, minute, 0, 0);
          onChange?.(newDate);
        } else {
          baseHandleDateClick(date);
        }
      },
      [showTimePicker, hour, minute, onChange, baseHandleDateClick]
    );

    const handleHourChange = useCallback(
      (newHour: number) => {
        setHour(newHour);
        if (selectedDate) {
          const newDate = new Date(selectedDate);
          newDate.setHours(newHour, minute, 0, 0);
          onChange?.(newDate);
        }
      },
      [selectedDate, minute, onChange]
    );

    const handleMinuteChange = useCallback(
      (newMinute: number) => {
        setMinute(newMinute);
        if (selectedDate) {
          const newDate = new Date(selectedDate);
          newDate.setHours(hour, newMinute, 0, 0);
          onChange?.(newDate);
        }
      },
      [selectedDate, hour, onChange]
    );

    return (
      <div
        ref={ref}
        className={cn(
          "border-border-subtle flex min-h-[345px] flex-col rounded-md border p-4",
          showTimePicker ? "w-[480px]" : "w-[356px]",
          disabled && "pointer-events-none opacity-50",
          className
        )}
      >
        <div className="flex gap-4">
          {/* Calendar Section */}
          <div className="flex flex-1 flex-col">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-text-secondary text-[18px] font-semibold">
                  {displayYearMonth}
                </span>
                <div className="text-text-disabled flex items-center gap-1 text-[13px]">
                  <CalendarIcon size="xsmall" />
                  <span>{displayText}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={goToPrevMonth}
                  className="text-text-disabled hover:text-text-secondary transition-colors"
                  aria-label="이전 달"
                >
                  <ChevronDownIcon size="small" className="rotate-90" />
                </button>
                <button
                  type="button"
                  onClick={goToNextMonth}
                  className="text-text-disabled hover:text-text-secondary transition-colors"
                  aria-label="다음 달"
                >
                  <ChevronDownIcon size="small" className="-rotate-90" />
                </button>
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
            <div className="grid flex-1 grid-cols-7">
              {calendarDays.map((day, index) => (
                <button
                  key={day.date ? day.date.toISOString() : `empty-${index}`}
                  type="button"
                  disabled={day.isDisabled || !day.date}
                  onClick={() => day.date && handleDateClick(day.date)}
                  className={cn(
                    "flex h-11 w-full items-center justify-center text-[15px] transition-colors",
                    !day.date && "cursor-default",
                    day.date && !day.isDisabled && "hover:bg-alpha-white-8 cursor-pointer",
                    day.isDisabled && "text-text-disabled cursor-not-allowed",
                    !day.isDisabled && !day.isSelected && "text-text-secondary",
                    day.isToday && !day.isSelected && "bg-alpha-white-16 rounded-sm"
                  )}
                >
                  {day.date ? (
                    <span
                      className={cn(
                        "flex h-9 w-9 items-center justify-center",
                        day.isSelected &&
                          "text-text-brand-default rounded-sm bg-green-500/10 font-semibold"
                      )}
                    >
                      {day.dayOfMonth}
                    </span>
                  ) : (
                    ""
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Time Picker Section */}
          {showTimePicker && (
            <div className="border-divider-subtle flex flex-col border-l pl-4">
              <span className="text-text-secondary mb-4 text-[18px] font-semibold">시간</span>
              <TimePickerPanel
                hour={hour}
                minute={minute}
                onHourChange={handleHourChange}
                onMinuteChange={handleMinuteChange}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
);

DatePickerSingle.displayName = "DatePickerSingle";

export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>((props, ref) => {
  if (isRangeProps(props)) {
    return <DatePickerRange ref={ref} {...props} />;
  }
  return <DatePickerSingle ref={ref} {...props} />;
});

DatePicker.displayName = "DatePicker";
