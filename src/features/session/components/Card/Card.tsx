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
  /** description 표시 여부. false여도 nickname은 표시됩니다. (default: true) */
  showDescription?: boolean;
  currentParticipants: number;
  maxParticipants: number;
  durationMinutes: number;
  sessionDate: Date | string;
  /** Figma layout 변형 (default: "vertical") */
  layout?: "vertical" | "horizontal";
  /** Figma size 변형 또는 명시적 반응형 density (default: "md") */
  size?: "md" | "sm" | "responsive";
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

  const renderStatusBadge = () => {
    if (isPastTime(sessionDate)) {
      return (
        <ChipBadge
          radius="max"
          status="inProgress"
          className={cn(
            size === "sm" && "px-2 text-[10px]",
            size === "md" && "px-3 text-xs",
            size === "responsive" && "px-2 text-[10px] md:px-3 md:text-xs"
          )}
        >
          진행중
        </ChipBadge>
      );
    }
    if (statusText) {
      return (
        <ChipBadge
          radius="max"
          status={statusBadgeStatus ?? "recruiting"}
          className={cn(
            size === "sm" && "px-2 text-[10px]",
            size === "md" && "px-3 text-xs",
            size === "responsive" && "px-2 text-[10px] md:px-3 md:text-xs"
          )}
        >
          {statusText}
        </ChipBadge>
      );
    }
    if (createdAt) {
      return (
        <RelativeTimeBadge
          date={createdAt}
          className={cn(
            size === "sm" && "px-2 text-[10px]",
            size === "md" && "px-3 text-xs",
            size === "responsive" && "px-2 text-[10px] md:px-3 md:text-xs"
          )}
        />
      );
    }
    return null;
  };

  const renderSubtitle = () => {
    const shouldShowDescription = showDescription && description;

    if (!nickname && !shouldShowDescription) {
      return null;
    }

    return (
      <>
        {nickname && (
          <span
            className={cn(
              "text-text-muted font-semibold",
              size === "sm" && "text-xs",
              size === "md" && "text-xs",
              size === "responsive" && "text-xs"
            )}
          >
            {nickname}
          </span>
        )}
        {shouldShowDescription && (
          <p
            className={cn(
              "text-text-disabled truncate",
              size === "sm" && "text-[11px]",
              size === "md" && "text-xs",
              size === "responsive" && "text-[11px] md:text-xs"
            )}
          >
            {description}
          </p>
        )}
      </>
    );
  };

  const thumbnailClassName = isHorizontal
    ? isSm
      ? "self-stretch aspect-auto w-auto shrink-0"
      : size === "md"
        ? "h-[180px] w-[290px] shrink-0 aspect-auto"
        : "self-stretch aspect-auto w-auto shrink-0 md:h-[180px] md:w-[290px] md:self-auto"
    : "aspect-[320/170] w-full";

  const rootClassName = cn(
    "flex w-full",
    isHorizontal
      ? cn(
          "flex-row items-start",
          size === "sm" && "gap-3",
          size === "md" && "gap-4",
          size === "responsive" && "gap-3 md:gap-4"
        )
      : cn("flex-col", size === "md" ? "gap-4" : size === "sm" ? "gap-3" : "gap-3 md:gap-4"),
    className
  );

  const contentClassName = cn(
    "flex flex-col items-start",
    size === "sm" && "gap-3 py-1",
    size === "md" && "gap-4 py-2",
    size === "responsive" && "gap-3 py-1 md:gap-4 md:py-2",
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

      <div className={contentClassName}>
        <div className="flex w-full flex-col gap-2">
          <div className="flex items-center gap-2">
            <ChipBadge
              radius="xs"
              size={isSm ? "sm" : "md"}
              className={cn("border-0", size === "responsive" && "text-[10px] md:text-xs")}
            >
              {category}
            </ChipBadge>
            {renderStatusBadge()}
          </div>

          <div className="flex flex-col gap-1">
            <h3
              className={cn(
                "text-text-primary truncate font-bold",
                size === "sm" && "text-[15px]",
                size === "md" && "text-lg",
                size === "responsive" && "text-[15px] md:text-lg"
              )}
            >
              {title}
            </h3>
            {renderSubtitle()}
          </div>
        </div>

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
