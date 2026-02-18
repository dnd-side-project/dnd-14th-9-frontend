import type { DurationRange, SessionSort, TimeSlot } from "../../types";

export type FilterOption<TValue extends string = string> = {
  value: TValue;
  label: string;
};

export type TimeSlotFilterOption = {
  value: TimeSlot;
  triggerLabel: string;
  panelLabel: string;
};

export const SORT_OPTIONS: FilterOption<SessionSort>[] = [
  { value: "LATEST", label: "최신순" },
  { value: "POPULAR", label: "인기순" },
];

export const DURATION_OPTIONS: FilterOption<DurationRange>[] = [
  { value: "HALF_TO_ONE_HOUR", label: "30분 ~ 1시간" },
  { value: "TWO_TO_FOUR_HOURS", label: "2시간 ~ 4시간" },
  { value: "FIVE_TO_EIGHT_HOURS", label: "5시간 ~ 8시간" },
  { value: "TEN_PLUS_HOURS", label: "10시간 이상" },
];

export const PARTICIPANTS_OPTIONS: FilterOption<string>[] = [
  { value: "3", label: "3명 이하" },
  { value: "5", label: "5명 이하" },
  { value: "10", label: "10명 이하" },
];

export const TIME_SLOT_OPTIONS: TimeSlotFilterOption[] = [
  { value: "MORNING", triggerLabel: "오전(6-12시)", panelLabel: "오전 (6 ~ 12시)" },
  { value: "AFTERNOON", triggerLabel: "오후(12-18시)", panelLabel: "오후 (12 ~ 18시)" },
  { value: "EVENING", triggerLabel: "저녁(18-24시)", panelLabel: "저녁 (18 ~ 24시)" },
];

export function getOptionLabel<TValue extends string>(
  options: FilterOption<TValue>[],
  value: TValue | null,
  placeholder: string
) {
  return options.find((option) => option.value === value)?.label ?? placeholder;
}

export function getNextOptionValue<TValue extends string>(
  options: FilterOption<TValue>[],
  currentValue: TValue | null
) {
  if (options.length === 0) return null;
  if (!currentValue) return options[0].value;

  const currentIndex = options.findIndex((option) => option.value === currentValue);
  if (currentIndex === -1) return options[0].value;

  const nextIndex = currentIndex + 1;
  return nextIndex < options.length ? options[nextIndex].value : null;
}
