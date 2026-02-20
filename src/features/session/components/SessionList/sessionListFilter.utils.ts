import type { DateRange } from "@/components/DatePicker/DatePicker.types";
import { formatDateRangeDisplay, getKoreanDayOfWeek } from "@/lib/utils/date";

import { SESSION_PARTICIPANTS_MAX, SESSION_PARTICIPANTS_MIN } from "../../constants/sessionLimits";

import { TIME_SLOT_OPTIONS } from "./sessionListFilter.types";

import type { DurationRange, TimeSlot } from "../../types";

export function parseDateParam(value: string | null) {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;

  const parsed = new Date(year, month - 1, day);
  if (Number.isNaN(parsed.getTime())) return null;

  parsed.setHours(0, 0, 0, 0);
  return parsed;
}

function formatSingleDateLabel(date: Date) {
  const year = String(date.getFullYear()).slice(2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dayOfWeek = getKoreanDayOfWeek(date);
  return `${year}.${month}.${day}(${dayOfWeek})`;
}

export function formatDateRangeFilterLabel(range: DateRange) {
  if (!range.startDate) return "시작 날짜";
  if (!range.endDate) return formatSingleDateLabel(range.startDate);

  return formatDateRangeDisplay(range.startDate, range.endDate).replaceAll("/", ".");
}

export function getTimeSlotFilterLabel(selectedTimeSlots: TimeSlot[]) {
  if (selectedTimeSlots.length === 0) return "시작 시간대";

  const selectedLabels = TIME_SLOT_OPTIONS.filter((option) =>
    selectedTimeSlots.includes(option.value)
  ).map((option) => option.triggerLabel);

  if (selectedLabels.length <= 1) {
    return selectedLabels[0] ?? "시작 시간대";
  }

  return `${selectedLabels[0]} 외 ${selectedLabels.length - 1}`;
}

const DURATION_TRIGGER_LABEL_MAP: Record<DurationRange, string> = {
  HALF_TO_ONE_HOUR: "30분-1시간",
  TWO_TO_FOUR_HOURS: "2시간-4시간",
  FIVE_TO_EIGHT_HOURS: "5시간-8시간",
  TEN_PLUS_HOURS: "10시간 이상",
};

export function getDurationFilterLabel(durationRange: DurationRange | null) {
  if (!durationRange) return "진행시간";
  return DURATION_TRIGGER_LABEL_MAP[durationRange];
}

function clampParticipantsFilterValue(value: number) {
  return Math.min(SESSION_PARTICIPANTS_MAX, Math.max(SESSION_PARTICIPANTS_MIN, value));
}

export function parseParticipantsFilterValue(value: string | null) {
  if (!value) return null;

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;

  return String(clampParticipantsFilterValue(Math.trunc(parsed)));
}

export function getParticipantsFilterLabel(participants: string | null) {
  if (!participants) return "인원";
  return `${participants}명`;
}
