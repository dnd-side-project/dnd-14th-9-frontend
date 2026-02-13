import { useState, useMemo, useCallback } from "react";

import {
  formatDateRangeDisplay,
  formatDateWithDay,
  formatYearMonth,
  isDateInRange,
  isPastDate,
  isSameDay,
  isToday,
  isWithinTwoWeeks,
} from "@/lib/utils/date";

import type { CalendarDay, DatePickerProps, DateRange } from "./DatePicker.types";

interface UseDatePickerReturn {
  currentMonth: Date;
  displayYearMonth: string;
  displayText: string;
  calendarDays: CalendarDay[];
  selectedRange: DateRange;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  handleDateClick: (date: Date) => void;
}

export function useDatePicker({
  value,
  defaultValue,
  onChange,
}: Pick<DatePickerProps, "value" | "defaultValue" | "onChange">): UseDatePickerReturn {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [internalRange, setInternalRange] = useState<DateRange>(
    defaultValue ?? { startDate: null, endDate: null }
  );
  const [selectionPhase, setSelectionPhase] = useState<"start" | "end">("start");

  const selectedRange = value ?? internalRange;
  const displayYearMonth = formatYearMonth(currentMonth);

  const displayText = useMemo(() => {
    if (selectedRange.startDate && selectedRange.endDate) {
      return formatDateRangeDisplay(selectedRange.startDate, selectedRange.endDate);
    }
    return formatDateWithDay(new Date());
  }, [selectedRange.startDate, selectedRange.endDate]);

  const calendarDays = useMemo((): CalendarDay[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: CalendarDay[] = [];

    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({
        date: null,
        dayOfMonth: 0,
        isToday: false,
        isPast: false,
        isSelected: false,
        isInRange: false,
        isRangeStart: false,
        isRangeEnd: false,
        isDisabled: true,
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isPast = isPastDate(date);
      const isTodayDate = isToday(date);
      const isSelectable = isWithinTwoWeeks(date);

      const isRangeStart = selectedRange.startDate
        ? isSameDay(date, selectedRange.startDate)
        : false;
      const isRangeEnd = selectedRange.endDate ? isSameDay(date, selectedRange.endDate) : false;
      const isSelected = isRangeStart || isRangeEnd;
      const isInRangeDate = isDateInRange(date, selectedRange.startDate, selectedRange.endDate);

      days.push({
        date,
        dayOfMonth: day,
        isToday: isTodayDate,
        isPast,
        isSelected,
        isInRange: isInRangeDate,
        isRangeStart,
        isRangeEnd,
        isDisabled: !isSelectable,
      });
    }

    const totalCells = days.length;
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 0; i < remainingCells; i++) {
      days.push({
        date: null,
        dayOfMonth: 0,
        isToday: false,
        isPast: false,
        isSelected: false,
        isInRange: false,
        isRangeStart: false,
        isRangeEnd: false,
        isDisabled: true,
      });
    }

    return days;
  }, [currentMonth, selectedRange]);

  const goToPrevMonth = useCallback(() => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const handleDateClick = useCallback(
    (date: Date) => {
      let newRange: DateRange;

      if (selectionPhase === "start") {
        newRange = { startDate: date, endDate: null };
        setSelectionPhase("end");
      } else {
        if (selectedRange.startDate && date >= selectedRange.startDate) {
          newRange = { startDate: selectedRange.startDate, endDate: date };
        } else {
          newRange = { startDate: date, endDate: null };
        }
        setSelectionPhase("start");
      }

      if (!value) {
        setInternalRange(newRange);
      }
      onChange?.(newRange);
    },
    [selectionPhase, selectedRange.startDate, value, onChange]
  );

  return {
    currentMonth,
    displayYearMonth,
    displayText,
    calendarDays,
    selectedRange,
    goToPrevMonth,
    goToNextMonth,
    handleDateClick,
  };
}
