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
}

export function CardMeta({
  className,
  currentParticipants,
  maxParticipants,
  durationMinutes,
  sessionDate,
}: CardMetaProps) {
  return (
    <div
      className={cn(
        "text-text-disabled flex flex-wrap items-center gap-x-2 gap-y-2 text-[10px] leading-none md:text-[11px]",
        className
      )}
    >
      <span className="flex shrink-0 items-center gap-1 whitespace-nowrap">
        <UsersIcon size="xsmall" className="size-3 md:size-4" />
        <span>{formatParticipantCount(currentParticipants, maxParticipants)}</span>
      </span>
      <span className="flex shrink-0 items-center gap-1 whitespace-nowrap">
        <ClockIcon size="xsmall" className="size-3 md:size-4" />
        <span>{formatSessionDuration(durationMinutes)}</span>
      </span>
      <span className="flex shrink-0 items-center gap-1 whitespace-nowrap">
        <CalendarIcon size="xsmall" className="size-3 md:size-4" />
        <span>{formatSessionDateTime(sessionDate)}</span>
      </span>
    </div>
  );
}
