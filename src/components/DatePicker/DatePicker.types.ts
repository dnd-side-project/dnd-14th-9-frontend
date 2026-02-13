export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export interface DatePickerProps {
  /** Currently selected date range (controlled mode) */
  value?: DateRange;
  /** Default date range for uncontrolled mode */
  defaultValue?: DateRange;
  /** Callback when date range changes */
  onChange?: (range: DateRange) => void;
  /** Disable the entire picker */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
}

export interface CalendarDay {
  date: Date | null;
  dayOfMonth: number;
  isToday: boolean;
  isPast: boolean;
  isSelected: boolean;
  isInRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isDisabled: boolean;
}
