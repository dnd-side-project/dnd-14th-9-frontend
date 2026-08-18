import { ChipBadge } from "@/components/ChipBadge/ChipBadge";
import { AnnouncementIcon } from "@/components/Icon/AnnouncementIcon";
import { CalendarIcon } from "@/components/Icon/CalendarIcon";
import { ClockIcon } from "@/components/Icon/ClockIcon";
import { UsersIcon } from "@/components/Icon/UsersIcon";
import { ProgressBar } from "@/components/ProgressBar/ProgressBar";
import { Thumbnail } from "@/components/Thumbnail/Thumbnail";
import type { SessionDetailResponse } from "@/features/session/types";
import { formatSessionDateTime } from "@/lib/utils/date";
import { formatParticipantCount, formatSessionDuration } from "@/lib/utils/format";

interface SessionInfoCardProps {
  session: SessionDetailResponse;
}

export function SessionInfoCard({ session }: SessionInfoCardProps) {
  const requiredAchievementRate = session.requiredAchievementRate ?? 0;
  const requiredFocusRate = session.requiredFocusRate ?? 0;

  return (
    <section className="gap-lg border-gray p-lg flex flex-col rounded-lg border max-md:rounded-none max-md:border-0 max-md:p-0">
      <div className="gap-lg flex flex-col xl:flex-row">
        {/* 왼쪽: 썸네일 (정보란 높이에 맞춰 늘어나되 최소 228px) */}
        <div className="w-full xl:w-[45%] xl:shrink-0 xl:self-stretch">
          <Thumbnail
            src={session.imageUrl}
            alt={session.title}
            radius="lg"
            className="xl:aspect-auto! xl:h-full xl:min-h-57"
          />
        </div>

        {/* 오른쪽: 정보 (상단에 카테고리, 최소 228px) */}
        <div className="gap-sm flex min-w-0 flex-col xl:min-h-57 xl:flex-1">
          <ChipBadge radius="xs" className="w-fit border-0">
            {session.category}
          </ChipBadge>
          <h2 className="text-lg font-bold text-gray-50 md:text-2xl">{session.title}</h2>
          <p className="text-sm text-gray-200 md:text-base">{session.summary}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 md:text-base">
            <span className="flex items-center gap-1">
              <UsersIcon size="small" className="max-md:h-4 max-md:w-4" />
              <span>
                {formatParticipantCount(session.currentParticipants, session.maxParticipants)}
              </span>
            </span>
            <span className="flex items-center gap-1">
              <ClockIcon size="small" className="max-md:h-4 max-md:w-4" />
              <span>{formatSessionDuration(session.sessionDurationMinutes)}</span>
            </span>
            <span className="flex items-center gap-1">
              <CalendarIcon size="small" className="max-md:h-4 max-md:w-4" />
              <span>{formatSessionDateTime(session.startTime)}</span>
            </span>
          </div>

          {/* 공지사항 */}
          <div className="px-lg py-lg mt-auto rounded-lg bg-gray-900">
            <p className="text-common-white flex items-center gap-1 text-sm font-semibold md:text-base">
              <AnnouncementIcon size="small" className="shrink-0 text-gray-400" />
              공지사항
            </p>
            <p className="mt-sm text-sm font-semibold text-gray-400 md:text-base">
              {session.notice}
            </p>
          </div>
        </div>
      </div>

      <div className="gap-lg flex flex-col xl:flex-row">
        <div className="px-lg py-lg gap-md bg-surface-default border-border-subtle flex flex-1 flex-col rounded-lg border xl:flex-row xl:items-center xl:justify-between xl:gap-0">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-gray-50 md:text-base">
              To do 달성도 범위 기준
            </p>
            <p className="text-sm text-gray-500 md:text-base">
              해당 달성도의 사용자만 참여할 수 있어요
            </p>
          </div>
          <div className="flex w-full shrink-0 flex-col items-end gap-1 xl:w-50">
            <span className="text-common-white text-[15px] font-bold">
              {requiredAchievementRate}%
            </span>
            <ProgressBar
              progress={requiredAchievementRate}
              indicatorClassName="ml-auto bg-green-600"
            />
          </div>
        </div>
        <div className="px-lg py-lg gap-md bg-surface-default border-border-subtle flex flex-1 flex-col rounded-lg border xl:flex-row xl:items-center xl:justify-between xl:gap-0">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-gray-50 md:text-base">세션 집중도 범위 기준</p>
            <p className="text-sm text-gray-500 md:text-base">
              해당 집중도의 사용자만 참여할 수 있어요
            </p>
          </div>
          <div className="flex w-full shrink-0 flex-col items-end gap-1 xl:w-50">
            <span className="text-common-white text-[15px] font-bold">{requiredFocusRate}%</span>
            <ProgressBar
              progress={requiredFocusRate}
              indicatorClassName="ml-auto bg-border-stronger"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
