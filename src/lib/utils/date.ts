export function formatDateDot(date: Date | string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

export function formatTimeHHMM(date: Date | string): string {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const time = formatTimeHHMM(d);

  return `${month}월 ${day}일 ${time}`;
}
