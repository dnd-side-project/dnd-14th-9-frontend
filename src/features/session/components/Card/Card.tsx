"use client";

import { Badge } from "@/components/Badge/Badge";
import { RelativeTimeBadge } from "@/components/RelativeTime/RelativeTimeBadge";
import { Thumbnail } from "@/components/Thumbnail/Thumbnail";
import { isPastTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils/utils";

import { CardMeta } from "./CardMeta";

export interface CardProps {
  className?: string;
  thumbnailSrc: string | null | undefined;
  category: string;
  createdAt?: Date | string;
  /** 직접 상태 뱃지 텍스트를 지정 (createdAt 기반 상대시간 대신 사용) */
  statusText?: string;
  /** 상태 뱃지 스타일 (statusText 사용 시 함께 지정) */
  statusBadgeStatus?: "recruiting" | "closing" | "inProgress" | "closed";
  title: string;
  nickname?: string;
  /** 제목 아래 설명 텍스트 (nickname 대신 표시) */
  description?: string;
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
  statusText,
  statusBadgeStatus,
  title,
  nickname,
  description,
  currentParticipants,
  maxParticipants,
  durationMinutes,
  sessionDate,
}: CardProps) {
  const renderStatusBadge = () => {
    if (isPastTime(sessionDate)) {
      return (
        <Badge radius="max" status="inProgress" className="px-2 text-[10px] md:px-3 md:text-xs">
          진행중
        </Badge>
      );
    }
    if (statusText) {
      return (
        <Badge
          radius="max"
          status={statusBadgeStatus ?? "recruiting"}
          className="px-2 text-[10px] md:px-3 md:text-xs"
        >
          {statusText}
        </Badge>
      );
    }
    if (createdAt) {
      return <RelativeTimeBadge date={createdAt} className="px-2 text-[10px] md:px-3 md:text-xs" />;
    }
    return null;
  };

  return (
    <div className={cn("flex w-full flex-col gap-3 md:gap-4", className)}>
      <Thumbnail src={thumbnailSrc} alt={title} radius="xs" border="sm" />

      {/* Root Frame */}
      <div className="flex flex-col gap-3 py-1 md:gap-4 md:py-2">
        {/* Container */}
        <div className="flex flex-col gap-2">
          {/* Badge Container */}
          <div className="flex items-center gap-2">
            <Badge radius="xs" className="border-0 text-[10px] md:text-xs">
              {category}
            </Badge>
            {renderStatusBadge()}
          </div>

          {/* Text Container */}
          <div className="flex flex-col gap-1">
            <h3 className="text-text-primary truncate text-[15px] font-bold md:text-lg">{title}</h3>

            {description ? (
              <p className="text-text-muted truncate text-xs">{description}</p>
            ) : nickname ? (
              <span className="text-text-muted text-xs font-semibold">{nickname}</span>
            ) : null}
          </div>
        </div>

        {/* Meta Container */}
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
