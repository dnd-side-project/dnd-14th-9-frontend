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
  /** Figma size 변형과 카드 density를 동기화합니다. */
  size?: "md" | "sm" | "responsive";
}

export function CardMeta({
  className,
  currentParticipants,
  maxParticipants,
  durationMinutes,
  sessionDate,
  size = "md",
}: CardMetaProps) {
  const iconClassName = cn(
    size === "sm" && "size-3",
    size === "md" && "size-4",
    size === "responsive" && "size-3 md:size-4"
  );
  const textClassName = cn(
    size === "sm" && "text-[10px]",
    size === "md" && "text-[11px]",
    size === "responsive" && "text-[10px] md:text-[11px]"
  );

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
