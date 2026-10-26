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
      className={`gap-xl p-xl bg-surface-default border-border-subtle flex flex-col rounded-lg border drop-shadow-[0_0_40px_rgba(0,0,0,0.3)] xl:flex-row xl:items-center ${className ?? ""}`}
    >
      {/* 왼쪽: 썸네일 (모바일·태블릿 풀폭 / 데스크탑 361px) */}
      <div className="h-50 xl:h-auto xl:w-[361px] xl:shrink-0 xl:self-stretch">
        <Thumbnail src={thumbnailUrl} alt={title} radius="md" border="sm" className="h-full" />
      </div>

      {/* 오른쪽: 정보 영역 */}
      <div className="gap-md flex flex-col xl:flex-1">
        <div className="gap-xs flex flex-col">
          {/* 카테고리 Badge */}
          <ChipBadge radius="xs" className="w-fit border-0">
            {category}
          </ChipBadge>

          <div className="gap-2xs flex flex-col">
            {/* 제목 */}
            <h2 className="text-text-primary text-2xl leading-[1.4] font-bold">{title}</h2>

            {/* 방 소개 */}
            <p className="text-text-tertiary text-[15px] leading-[1.4]">{description}</p>
          </div>
        </div>

        {/* 메타 정보 */}
        <CardMeta
          currentParticipants={currentParticipants}
          maxParticipants={maxParticipants}
          durationMinutes={durationMinutes}
          sessionDate={sessionDate}
          className="gap-x-sm text-base leading-[1.4]"
        />

        {/* 공지사항 */}
        <div className="gap-md p-lg bg-surface-strong mt-auto flex flex-row items-start rounded-md">
          <p className="text-text-tertiary flex shrink-0 items-center gap-1 text-base leading-[1.4] font-semibold whitespace-nowrap">
            <AnnouncementIcon size="small" className="shrink-0" />
            공지사항
          </p>
          <p className="text-text-tertiary text-[15px] leading-[1.4] whitespace-pre-line">
            {notice}
          </p>
        </div>
      </div>
    </section>
  );
}
