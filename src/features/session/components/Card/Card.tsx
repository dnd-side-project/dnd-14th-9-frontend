"use client";

import { ChipBadge, type ChipBadgeProps } from "@/components/ChipBadge/ChipBadge";
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
  statusBadgeStatus?: NonNullable<ChipBadgeProps["status"]>;
  title: string;
  nickname?: string;
  /** 제목 아래 설명 텍스트 */
  description?: string;
  /** description 표시 여부 (default: true) */
  showDescription?: boolean;
  currentParticipants: number;
  maxParticipants: number;
  durationMinutes: number;
  sessionDate: Date | string;
  /** Figma layout 변형 (default: "vertical") */
  layout?: "vertical" | "horizontal";
  /** Figma size 변형 (default: "md") */
  size?: "md" | "sm";
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
  showDescription = true,
  currentParticipants,
  maxParticipants,
  durationMinutes,
  sessionDate,
  layout = "vertical",
  size = "md",
}: CardProps) {
  const isHorizontal = layout === "horizontal";
  const isSm = size === "sm";

  const statusBadgeClassName = isSm ? "px-2 text-[10px]" : "px-3 text-xs";

  const renderStatusBadge = () => {
    if (isPastTime(sessionDate)) {
      return (
        <ChipBadge radius="max" status="inProgress" className={statusBadgeClassName}>
          진행중
        </ChipBadge>
      );
    }
    if (statusText) {
      return (
        <ChipBadge
          radius="max"
          status={statusBadgeStatus ?? "recruiting"}
          className={statusBadgeClassName}
        >
          {statusText}
        </ChipBadge>
      );
    }
    if (createdAt) {
      return <RelativeTimeBadge date={createdAt} className={statusBadgeClassName} />;
    }
    return null;
  };

  /**
   * 타이틀 아래 서브텍스트
   * - description이 있고 showDescription=true이면 description 표시
   * - 그 외 nickname이 있으면 nickname 표시
   */
  const renderSubtitle = () => {
    if (showDescription && description) {
      return (
        <p className={cn("text-text-disabled truncate", isSm ? "text-[11px]" : "text-xs")}>
          {description}
        </p>
      );
    }
    if (nickname) {
      return <span className="text-text-muted text-xs font-semibold">{nickname}</span>;
    }
    return null;
  };

  // Thumbnail 크기: layout × size 조합으로 결정
  const thumbnailClassName = isHorizontal
    ? isSm
      ? "self-stretch aspect-auto w-auto shrink-0"
      : "h-[180px] w-[290px] shrink-0 aspect-auto"
    : "aspect-[320/170] w-full";

  // 루트 컨테이너
  const rootClassName = cn(
    "flex w-full",
    isHorizontal
      ? cn("flex-row items-start", isSm ? "gap-3" : "gap-4")
      : cn("flex-col", isSm ? "gap-3" : "gap-4"),
    className
  );

  // 콘텐츠 영역(Root Frame)
  const contentClassName = cn(
    "flex flex-col items-start",
    isSm ? "gap-3 py-1" : "gap-4 py-2",
    isHorizontal ? "flex-1 min-w-0" : "w-full"
  );

  return (
    <div className={rootClassName}>
      <Thumbnail
        src={thumbnailSrc}
        alt={title}
        radius="xs"
        border="sm"
        className={thumbnailClassName}
      />

      {/* Root Frame */}
      <div className={contentClassName}>
        {/* Container */}
        <div className="flex w-full flex-col gap-2">
          {/* Badge Container */}
          <div className="flex items-center gap-2">
            <ChipBadge radius="xs" size={isSm ? "sm" : "md"} className="border-0">
              {category}
            </ChipBadge>
            {renderStatusBadge()}
          </div>

          {/* Text Container */}
          <div className="flex flex-col gap-1">
            <h3
              className={cn(
                "text-text-primary truncate font-bold",
                isSm ? "text-[15px]" : "text-lg"
              )}
            >
              {title}
            </h3>
            {renderSubtitle()}
          </div>
        </div>

        {/* Meta Container */}
        <CardMeta
          currentParticipants={currentParticipants}
          maxParticipants={maxParticipants}
          durationMinutes={durationMinutes}
          sessionDate={sessionDate}
          size={size}
        />
      </div>
    </div>
  );
}
