"use client";

import { Badge } from "@/components/Badge/Badge";
import { Thumbnail } from "@/components/Thumbnail/Thumbnail";
import { formatRelativeTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils/utils";

import { CardMeta } from "./CardMeta";

export interface CardProps {
  className?: string;
  thumbnailSrc: string | null | undefined;
  category: string;
  createdAt: Date | string;
  title: string;
  nickname: string;
  currentParticipants: number;
  maxParticipants: number;
  durationMinutes: number;
  sessionDate: Date | string;
}

export function Card({
  className,
  thumbnailSrc,
  category,
  createdAt,
  title,
  nickname,
  currentParticipants,
  maxParticipants,
  durationMinutes,
  sessionDate,
}: CardProps) {
  const relativeTime = formatRelativeTime(createdAt);
  const isClosing = relativeTime === "마감임박" || relativeTime === "마감 임박";
  const displayRelativeTime = isClosing ? "마감임박" : relativeTime;

  return (
    <div className={cn("flex w-full max-w-69 flex-col gap-4", className)}>
      <Thumbnail src={thumbnailSrc} alt={title} />

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge radius="xs" className="border-0">
            {category}
          </Badge>
          <Badge radius="max" status={isClosing ? "closing" : "recruiting"}>
            {displayRelativeTime}
          </Badge>
        </div>

        <h3 className="text-text-primary truncate text-lg font-bold">{title}</h3>

        <span className="text-text-muted text-xs font-semibold">{nickname}</span>

        <CardMeta
          currentParticipants={currentParticipants}
          maxParticipants={maxParticipants}
          durationMinutes={durationMinutes}
          sessionDate={sessionDate}
        />
      </div>
    </div>
  );
}
