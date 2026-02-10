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
  return (
    <div className={cn("flex w-full flex-col gap-3", className)}>
      <Thumbnail src={thumbnailSrc} alt={title} />

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge radius="xs">{category}</Badge>
          <Badge radius="max">{formatRelativeTime(createdAt)}</Badge>
        </div>

        <h3 className="text-text-primary truncate text-base font-semibold">{title}</h3>

        <span className="text-text-secondary text-sm">{nickname}</span>

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
