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
  { value: "POPULAR", label: "인기순" },
  { value: "LATEST", label: "최신순" },
  { value: "DEADLINE_APPROACHING", label: "마감순" },
];

export const DURATION_OPTIONS: FilterOption<DurationRange>[] = [
  { value: "ONE_HOUR_OR_LESS", label: "1시간 이하" },
  { value: "ONE_TO_TWO_HOURS", label: "1시간 ~ 2시간" },
  { value: "TWO_TO_THREE_HOURS", label: "2시간 ~ 3시간" },
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
