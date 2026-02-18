import type { TimeSlot } from "../types";

export const TIME_SLOT_ORDER: TimeSlot[] = ["MORNING", "AFTERNOON", "EVENING"];

export const TIME_SLOT_OPTIONS: Array<{
  value: TimeSlot;
  triggerLabel: string;
  panelLabel: string;
}> = [
  { value: "MORNING", triggerLabel: "오전(6-12시)", panelLabel: "오전 (6 ~ 12시)" },
  { value: "AFTERNOON", triggerLabel: "오후(12-18시)", panelLabel: "오후 (12 ~ 18시)" },
  { value: "EVENING", triggerLabel: "저녁(18-24시)", panelLabel: "저녁 (18 ~ 24시)" },
];

const TIME_SLOT_SET = new Set<TimeSlot>(TIME_SLOT_ORDER);

export function parseTimeSlotsParam(value: string | null): TimeSlot[] {
  if (!value) return [];

  const selectedTimeSlots = new Set<TimeSlot>();

  for (const rawValue of value.split(",")) {
    const normalizedValue = rawValue.trim();
    if (TIME_SLOT_SET.has(normalizedValue as TimeSlot)) {
      selectedTimeSlots.add(normalizedValue as TimeSlot);
    }
  }

  return TIME_SLOT_ORDER.filter((timeSlot) => selectedTimeSlots.has(timeSlot));
}

export function formatTimeSlotsParam(timeSlots: TimeSlot[]): string | null {
  const selectedTimeSlots = new Set<TimeSlot>();

  for (const timeSlot of timeSlots) {
    if (TIME_SLOT_SET.has(timeSlot)) {
      selectedTimeSlots.add(timeSlot);
    }
  }

  const orderedTimeSlots = TIME_SLOT_ORDER.filter((timeSlot) => selectedTimeSlots.has(timeSlot));
  return orderedTimeSlots.length > 0 ? orderedTimeSlots.join(",") : null;
}
