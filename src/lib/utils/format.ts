const SECONDS_IN_HOUR = 3600;

export function formatTimer(seconds: number): string {
  const h = Math.floor(seconds / SECONDS_IN_HOUR);
  const m = Math.floor((seconds % SECONDS_IN_HOUR) / 60);
  const s = seconds % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (h > 0) {
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }
  return `${pad(m)}:${pad(s)}`;
}

export function formatRemaningTimer(seconds: number): string {
  if (seconds < 0) return "곧 시작";

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / SECONDS_IN_HOUR);
  const minutes = Math.floor((seconds % SECONDS_IN_HOUR) / 60);

  const parts: string[] = [];

  if (days > 0) parts.push(`${days}일`);
  if (hours > 0) parts.push(`${hours}시간`);
  if (minutes > 0 && days === 0) parts.push(`${minutes}분`);

  return parts.length > 0 ? parts.join(" ") : "1분 미만";
}

export function isUrgent(seconds: number): boolean {
  return seconds > 0 && seconds < SECONDS_IN_HOUR;
}

export function formatParticipantCount(current: number, max: number): string {
  return `${current} / ${max}명`;
}

export function formatSessionDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) return `${hours}시간 ${mins}분`;
  if (hours > 0) return `${hours}시간`;
  return `${mins}분`;
}
