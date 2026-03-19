import { useState } from "react";

import {
  formatDateRangeDisplay,
  formatDateWithDay,
  formatYearMonth,
  isDateInRange,
  isSameDay,
} from "@/lib/utils/date";

import type {
  CalendarDay,
  DatePickerRangeProps,
  DatePickerSingleProps,
  DateRange,
} from "./DatePicker.types";

interface UseDatePickerRangeReturn {
  currentMonth: Date;
  displayYearMonth: string;
  displayText: string;
  calendarDays: CalendarDay[];
  selectedRange: DateRange;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  handleDateClick: (date: Date) => void;
}

interface UseDatePickerSingleReturn {
  currentMonth: Date;
  displayYearMonth: string;
  displayText: string;
  calendarDays: CalendarDay[];
  selectedDate: Date | null;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  handleDateClick: (date: Date) => void;
}

export function useDatePicker({
  value,
  defaultValue,
  onChange,
}: Pick<DatePickerRangeProps, "value" | "defaultValue" | "onChange">): UseDatePickerRangeReturn {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [internalRange, setInternalRange] = useState<DateRange>(
    defaultValue ?? { startDate: null, endDate: null }
  );
  const [selectionPhase, setSelectionPhase] = useState<"start" | "end">("start");

  const selectedRange = value ?? internalRange;
  const displayYearMonth = formatYearMonth(currentMonth);

  const displayText =
    selectedRange.startDate && selectedRange.endDate
      ? formatDateRangeDisplay(selectedRange.startDate, selectedRange.endDate)
      : formatDateWithDay(new Date());

  const calendarDays = ((): CalendarDay[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    // 루프 전에 한 번만 계산
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    const twoWeeksLater = new Date(today);
    twoWeeksLater.setDate(today.getDate() + 14);
    const twoWeeksLaterTime = twoWeeksLater.getTime();

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
      date.setHours(0, 0, 0, 0);
      const dateTime = date.getTime();

      const isPast = dateTime < todayTime;
      const isTodayDate = dateTime === todayTime;
      const isSelectable = dateTime >= todayTime && dateTime <= twoWeeksLaterTime;

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
  })();

  const goToPrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    let newRange: DateRange;

    if (selectionPhase === "start") {
      newRange = { startDate: date, endDate: null };
      setSelectionPhase("end");
    } else {
      if (selectedRange.startDate) {
        // 클릭한 날짜가 startDate 이후면 그대로, 이전이면 swap
        if (date >= selectedRange.startDate) {
          newRange = { startDate: selectedRange.startDate, endDate: date };
        } else {
          newRange = { startDate: date, endDate: selectedRange.startDate };
        }
      } else {
        newRange = { startDate: date, endDate: null };
      }
      setSelectionPhase("start");
    }

    if (!value) {
      setInternalRange(newRange);
    }
    onChange?.(newRange);
  };

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

export function useDatePickerSingle({
  value,
  defaultValue,
  onChange,
}: Pick<DatePickerSingleProps, "value" | "defaultValue" | "onChange">): UseDatePickerSingleReturn {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [internalDate, setInternalDate] = useState<Date | null>(defaultValue ?? null);

  const selectedDate = value !== undefined ? value : internalDate;
  const displayYearMonth = formatYearMonth(currentMonth);

  const displayText = selectedDate
    ? formatDateWithDay(selectedDate)
    : formatDateWithDay(new Date());

  const calendarDays = ((): CalendarDay[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

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
      date.setHours(0, 0, 0, 0);
      const dateTime = date.getTime();

      const isPast = dateTime < todayTime;
      const isTodayDate = dateTime === todayTime;
      const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;

      days.push({
        date,
        dayOfMonth: day,
        isToday: isTodayDate,
        isPast,
        isSelected,
        isInRange: false,
        isRangeStart: false,
        isRangeEnd: false,
        isDisabled: isPast,
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
  })();

  const goToPrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    if (value === undefined) {
      setInternalDate(date);
    }
    onChange?.(date);
  };

  return {
    currentMonth,
    displayYearMonth,
    displayText,
    calendarDays,
    selectedDate,
    goToPrevMonth,
    goToNextMonth,
    handleDateClick,
  };
}
