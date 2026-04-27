import { CalendarIcon } from "@/components/Icon/CalendarIcon";
import { ClockIcon } from "@/components/Icon/ClockIcon";
import { UsersIcon } from "@/components/Icon/UsersIcon";
import { formatSessionDateTime } from "@/lib/utils/date";
import { formatParticipantCount, formatSessionDuration } from "@/lib/utils/format";
import { cn } from "@/lib/utils/utils";

export interface CardMetaProps {
  className?: string;
  currentParticipants: number;
  maxParticipants: number;
  durationMinutes: number;
  sessionDate: Date | string;
  /** Figma size 변형 — md: 16px 아이콘 / 11px 텍스트, sm: 12px 아이콘 / 10px 텍스트 */
  size?: "md" | "sm";
}

export function CardMeta({
  className,
  currentParticipants,
  maxParticipants,
  durationMinutes,
  sessionDate,
  size = "md",
}: CardMetaProps) {
  const iconClassName = size === "sm" ? "size-3" : "size-4";
  const textClassName = size === "sm" ? "text-[10px]" : "text-[11px]";

  return (
    <div
      className={cn(
        "text-text-disabled flex flex-wrap items-center gap-x-2 gap-y-2 leading-none",
        textClassName,
        className
      )}
    >
      <span className="flex shrink-0 items-center gap-1 whitespace-nowrap">
        <UsersIcon className={iconClassName} />
        <span>{formatParticipantCount(currentParticipants, maxParticipants)}</span>
      </span>
      <span className="flex shrink-0 items-center gap-1 whitespace-nowrap">
        <ClockIcon className={iconClassName} />
        <span>{formatSessionDuration(durationMinutes)}</span>
      </span>
      <span className="flex shrink-0 items-center gap-1 whitespace-nowrap">
        <CalendarIcon className={iconClassName} />
        <span>{formatSessionDateTime(sessionDate)}</span>
      </span>
    </div>
  );
}
