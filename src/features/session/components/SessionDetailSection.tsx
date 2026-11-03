import { ChipBadge } from "@/components/ChipBadge/ChipBadge";
import { AnnouncementIcon } from "@/components/Icon/AnnouncementIcon";
import { Thumbnail } from "@/components/Thumbnail/Thumbnail";

import { CardMeta } from "./Card/CardMeta";

interface SessionDetailSectionProps {
  className?: string;
  thumbnailUrl: string;
  category: string;
  title: string;
  description: string;
  currentParticipants: number;
  maxParticipants: number;
  durationMinutes: number;
  sessionDate: Date | string;
  notice: string;
}

export function SessionDetailSection({
  className,
  thumbnailUrl,
  category,
  title,
  description,
  currentParticipants,
  maxParticipants,
  durationMinutes,
  sessionDate,
  notice,
}: SessionDetailSectionProps) {
  return (
    <section
      className={`gap-xl md:bg-surface-default md:border-border-subtle md:p-xl flex flex-col md:rounded-lg md:border md:drop-shadow-[0_0_40px_rgba(0,0,0,0.3)] xl:flex-row xl:items-center ${className ?? ""}`}
    >
      {/* 왼쪽: 썸네일 (모바일 335:160 · 태블릿 640:250 비율로 폭을 채움 / 데스크탑 361px 고정, 열 높이에 맞춤) */}
      <div className="xl:w-[361px] xl:shrink-0 xl:self-stretch">
        <Thumbnail
          src={thumbnailUrl}
          alt={title}
          radius="xs"
          border="none"
          className="xl:border-sm aspect-[335/160] md:aspect-[640/250] xl:aspect-auto xl:h-full xl:rounded-md"
        />
      </div>

      {/* 오른쪽: 정보 영역 */}
      <div className="gap-sm md:gap-md flex flex-col xl:flex-1">
        <div className="gap-xs flex flex-col">
          {/* 카테고리 Badge */}
          <ChipBadge radius="xs" className="w-fit border-0">
            {category}
          </ChipBadge>

          <div className="gap-2xs flex flex-col">
            {/* 제목 */}
            <h2 className="text-text-primary text-lg leading-[1.4] font-bold md:text-2xl">
              {title}
            </h2>

            {/* 방 소개 */}
            <p className="text-text-tertiary text-[11px] leading-[1.4] md:text-[15px]">
              {description}
            </p>
          </div>
        </div>

        {/* 메타 정보 */}
        <CardMeta
          currentParticipants={currentParticipants}
          maxParticipants={maxParticipants}
          durationMinutes={durationMinutes}
          sessionDate={sessionDate}
          size="responsive"
          className="md:gap-x-sm leading-[1.4] md:text-base"
        />

        {/* 공지사항 */}
        <div className="gap-xs p-sm bg-surface-strong md:gap-md md:p-lg mt-auto flex flex-col items-start rounded-md md:flex-row">
          <p className="text-text-tertiary flex shrink-0 items-center gap-1 text-xs leading-[1.4] font-semibold whitespace-nowrap md:text-base">
            <AnnouncementIcon size="small" className="shrink-0 max-md:size-4" />
            공지사항
          </p>
          <p className="text-text-tertiary text-[11px] leading-[1.4] whitespace-pre-line md:text-[15px]">
            {notice}
          </p>
        </div>
      </div>
    </section>
  );
}
