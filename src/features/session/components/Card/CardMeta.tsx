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
    <div className={cn("text-text-tertiary flex items-center gap-3 text-xs", className)}>
      <span className="flex items-center gap-1">
        <UsersIcon size="xsmall" />
        <span>{formatParticipantCount(currentParticipants, maxParticipants)}</span>
      </span>
      <span className="flex items-center gap-1">
        <ClockIcon size="xsmall" />
        <span>{formatSessionDuration(durationMinutes)}</span>
      </span>
      <span className="flex items-center gap-1">
        <CalendarIcon size="xsmall" />
        <span>{formatSessionDateTime(sessionDate)}</span>
      </span>
    </div>
  );
}
