export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export interface DatePickerBaseProps {
  /** Disable the entire picker */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
}

export interface DatePickerRangeProps extends DatePickerBaseProps {
  /** Selection mode */
  mode?: "range";
  /** Currently selected date range (controlled mode) */
  value?: DateRange;
  /** Default date range for uncontrolled mode */
  defaultValue?: DateRange;
  /** Callback when date range changes */
  onChange?: (range: DateRange) => void;
  /** Show time picker (not available in range mode) */
  showTimePicker?: false;
}

export interface DatePickerSingleProps extends DatePickerBaseProps {
  /** Selection mode */
  mode: "single";
  /** Currently selected date (controlled mode) */
  value?: Date | null;
  /** Default date for uncontrolled mode */
  defaultValue?: Date | null;
  /** Callback when date changes */
  onChange?: (date: Date | null) => void;
  /** Show time picker */
  showTimePicker?: boolean;
}

export type DatePickerProps = DatePickerRangeProps | DatePickerSingleProps;

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
