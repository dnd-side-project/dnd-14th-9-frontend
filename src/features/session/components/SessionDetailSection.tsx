"use client";

import { Badge } from "@/components/Badge/Badge";
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
      className={`gap-lg p-lg border-border-gray-default flex rounded-lg border ${className ?? ""}`}
    >
      {/* 왼쪽: 썸네일 (30%) */}
      <div className="flex-3">
        <Thumbnail src={thumbnailUrl} alt={title} radius="lg" className="h-full" />
      </div>

      {/* 오른쪽: 정보 영역 (70%) */}
      <div className="gap-sm flex flex-7 flex-col">
        {/* 카테고리 Badge */}
        <Badge radius="xs" className="w-fit border-0">
          {category}
        </Badge>

        {/* 제목 */}
        <h2 className="text-[24px] font-bold text-gray-50">{title}</h2>

        {/* 방 소개 */}
        <p className="text-[16px] text-gray-200">{description}</p>

        {/* 메타 정보 */}
        <CardMeta
          currentParticipants={currentParticipants}
          maxParticipants={maxParticipants}
          durationMinutes={durationMinutes}
          sessionDate={sessionDate}
          className="text-[14px]"
        />

        {/* 공지사항 */}
        <div className="px-lg py-lg gap-md mt-auto flex flex-row rounded-lg bg-gray-900">
          <p className="text-common-white text-[16px] font-semibold">공지사항</p>
          <p className="text-[16px] text-gray-400">{notice}</p>
        </div>
      </div>
    </section>
  );
}
