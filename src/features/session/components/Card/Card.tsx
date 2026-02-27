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
  // 세션 시작 시간이 이미 지났으면 inProgress 뱃지 우선 표시
  // statusText가 명시적으로 제공되면 직접 Badge 사용
  // 그 외에 createdAt이 있으면 RelativeTimeBadge 사용 (hydration 안전)
  const renderStatusBadge = () => {
    if (isPastTime(sessionDate)) {
      return (
        <Badge radius="max" status="inProgress">
          진행중
        </Badge>
      );
    }
    if (statusText) {
      return (
        <Badge radius="max" status={statusBadgeStatus ?? "recruiting"}>
          {statusText}
        </Badge>
      );
    }
    if (createdAt) {
      return <RelativeTimeBadge date={createdAt} />;
    }
    return null;
  };

  return (
    <div className={cn("flex w-full max-w-69 flex-col gap-4", className)}>
      <Thumbnail src={thumbnailSrc} alt={title} radius="xs" border="sm" />

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge radius="xs" className="border-0">
            {category}
          </Badge>
          {renderStatusBadge()}
        </div>

        <h3 className="text-text-primary truncate text-lg font-bold">{title}</h3>

        {description ? (
          <p className="text-text-muted truncate text-xs">{description}</p>
        ) : nickname ? (
          <span className="text-text-muted text-xs font-semibold">{nickname}</span>
        ) : null}

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
