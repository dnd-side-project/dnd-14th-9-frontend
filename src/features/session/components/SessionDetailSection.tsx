import { ChipBadge } from "@/components/ChipBadge/ChipBadge";
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
      className={`gap-lg flex flex-col rounded-lg xl:flex-row xl:items-start ${className ?? ""}`}
    >
      {/* 썸네일: Thumbnail 내장 aspect-ratio(276/146) 사용, 데스크탑 30% */}
      <div className="xl:flex-3">
        <Thumbnail src={thumbnailUrl} alt={title} radius="lg" />
      </div>

      {/* 정보 영역: 데스크탑 70% */}
      <div className="gap-sm flex flex-col xl:flex-7">
        {/* 카테고리 Badge */}
        <ChipBadge radius="xs" className="w-fit border-0">
          {category}
        </ChipBadge>

        {/* 제목 */}
        <h2 className="text-2xl font-bold text-gray-50">{title}</h2>

        {/* 방 소개 */}
        <p className="text-base text-gray-200">{description}</p>

        {/* 메타 정보 */}
        <CardMeta
          currentParticipants={currentParticipants}
          maxParticipants={maxParticipants}
          durationMinutes={durationMinutes}
          sessionDate={sessionDate}
          className="text-sm"
        />

        {/* 공지사항 */}
        <div className="px-lg py-lg gap-md mt-auto flex flex-row rounded-lg bg-gray-900">
          <p className="text-common-white text-base font-semibold">공지사항</p>
          <p className="text-base text-gray-400">{notice}</p>
        </div>
      </div>
    </section>
  );
}
