export function formatDateDot(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

export function formatTimeHHMM(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function formatDateTime(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const time = formatTimeHHMM(d);

  return `${month}월 ${day}일 ${time}`;
}

export function isToday(date: Date | string): boolean {
  const d = date instanceof Date ? date : new Date(date);
  const today = new Date();

  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

export function isPastTime(date: Date | string): boolean {
  return new Date(date).getTime() < Date.now();
}

export function formatRelativeTime(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays >= 1) return `${diffDays}일 전`;
  if (diffHours >= 1) return `${diffHours}시간 전`;
  return "마감임박";
}

export function formatSessionDateTime(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const period = hours < 12 ? "오전" : "오후";
  const displayHours = hours % 12 || 12;

  return `${month}/${day} · ${period} ${displayHours}:${minutes}`;
}

export function isPastDate(date: Date | string): boolean {
  const d = date instanceof Date ? date : new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);

  return target.getTime() < today.getTime();
}

export function formatYearMonth(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");

  return `${year}.${month}`;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function isDateInRange(date: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;

  const d = new Date(date);
  const s = new Date(start);
  const e = new Date(end);

  d.setHours(0, 0, 0, 0);
  s.setHours(0, 0, 0, 0);
  e.setHours(0, 0, 0, 0);

  return d.getTime() >= s.getTime() && d.getTime() <= e.getTime();
}

const KOREAN_DAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function getKoreanDayOfWeek(date: Date): string {
  return KOREAN_DAYS[date.getDay()];
}

export function formatDateWithDay(date: Date): string {
  const year = String(date.getFullYear()).slice(2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dayOfWeek = getKoreanDayOfWeek(date);

  return `${year}/${month}/${day}(${dayOfWeek})`;
}

export function formatDateRangeDisplay(start: Date, end: Date): string {
  const startYear = String(start.getFullYear()).slice(2);
  const startMonth = String(start.getMonth() + 1).padStart(2, "0");
  const startDay = String(start.getDate()).padStart(2, "0");
  const startDayOfWeek = getKoreanDayOfWeek(start);

  const isSameYear = start.getFullYear() === end.getFullYear();
  const isSameMonth = isSameYear && start.getMonth() === end.getMonth();

  const endDayOfWeek = getKoreanDayOfWeek(end);

  if (isSameMonth) {
    const endDay = String(end.getDate()).padStart(2, "0");
    return `${startYear}/${startMonth}/${startDay}(${startDayOfWeek}) ~ ${endDay}(${endDayOfWeek})`;
  }

  const endYear = String(end.getFullYear()).slice(2);
  const endMonth = String(end.getMonth() + 1).padStart(2, "0");
  const endDay = String(end.getDate()).padStart(2, "0");
  return `${startYear}/${startMonth}/${startDay}(${startDayOfWeek}) ~ ${endYear}/${endMonth}/${endDay}(${endDayOfWeek})`;
}

export function isWithinTwoWeeks(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const twoWeeksLater = new Date(today);
  twoWeeksLater.setDate(today.getDate() + 14);

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  return target.getTime() >= today.getTime() && target.getTime() <= twoWeeksLater.getTime();
}
