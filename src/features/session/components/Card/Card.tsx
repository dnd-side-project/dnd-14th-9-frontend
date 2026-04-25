"use client";

import { ChipBadge } from "@/components/ChipBadge/ChipBadge";
import { RelativeTimeBadge } from "@/components/RelativeTime/RelativeTimeBadge";
import { Thumbnail } from "@/components/Thumbnail/Thumbnail";
import { isPastTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils/utils";

import { CardMeta } from "./CardMeta";

const STATUS_BADGE_CLASS_NAME = "px-2 text-[10px] md:px-3 md:text-xs";

function renderSubtitle({ description, nickname }: { description?: string; nickname?: string }) {
  if (description) {
    return <p className="text-text-muted truncate text-xs">{description}</p>;
  }

  if (nickname) {
    return <span className="text-text-muted text-xs font-semibold">{nickname}</span>;
  }

  return null;
}

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
        <ChipBadge radius="max" status="inProgress" className={STATUS_BADGE_CLASS_NAME}>
          진행중
        </ChipBadge>
      );
    }
    if (statusText) {
      return (
        <ChipBadge
          radius="max"
          status={statusBadgeStatus ?? "recruiting"}
          className={STATUS_BADGE_CLASS_NAME}
        >
          {statusText}
        </ChipBadge>
      );
    }
    if (createdAt) {
      return <RelativeTimeBadge date={createdAt} className={STATUS_BADGE_CLASS_NAME} />;
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
            <ChipBadge radius="xs" className="border-0 text-[10px] md:text-xs">
              {category}
            </ChipBadge>
            {renderStatusBadge()}
          </div>

          {/* Text Container */}
          <div className="flex flex-col gap-1">
            <h3 className="text-text-primary truncate text-[15px] font-bold md:text-lg">{title}</h3>

            {renderSubtitle({ description, nickname })}
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
