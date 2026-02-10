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
