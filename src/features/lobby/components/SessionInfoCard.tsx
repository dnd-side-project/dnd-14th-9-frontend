import { CalendarIcon } from "@/components/Icon/CalendarIcon";
import { ClockIcon } from "@/components/Icon/ClockIcon";
import { ShareIcon } from "@/components/Icon/ShareIcon";
import { UsersIcon } from "@/components/Icon/UsersIcon";
import { ProgressBar } from "@/components/ProgressBar/ProgressBar";
import { Thumbnail } from "@/components/Thumbnail/Thumbnail";
import { useShareSession } from "@/features/session/hooks/useShareSession";
import type { SessionDetailResponse } from "@/features/session/types";
import { formatSessionDateTime } from "@/lib/utils/date";
import { formatParticipantCount, formatSessionDuration } from "@/lib/utils/format";

interface SessionInfoCardProps {
  session: SessionDetailResponse;
}

export function SessionInfoCard({ session }: SessionInfoCardProps) {
  const { shareSession } = useShareSession();
  const requiredAchievementRate = session.requiredAchievementRate ?? 0;
  const requiredFocusRate = session.requiredFocusRate ?? 0;

  return (
    <section className="gap-lg p-lg border-gray flex flex-col rounded-lg border">
      <div className="gap-lg flex">
        <div className="gap-sm flex flex-1 flex-col">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-50">{session.title}</h2>
            <button
              type="button"
              onClick={() => shareSession(session.sessionId)}
              className="text-text-muted hover:text-text-primary cursor-pointer rounded-sm p-1 transition-colors"
              aria-label="세션 링크 복사"
            >
              <ShareIcon size="small" />
            </button>
          </div>
          <p className="text-base text-gray-200">{session.summary}</p>
          <div className="flex items-center gap-4 text-base text-gray-400">
            <span className="flex items-center gap-1">
              <UsersIcon size="small" />
              <span>
                {formatParticipantCount(session.currentParticipants, session.maxParticipants)}
              </span>
            </span>
            <span className="flex items-center gap-1">
              <ClockIcon size="small" />
              <span>{formatSessionDuration(session.sessionDurationMinutes)}</span>
            </span>
            <span className="flex items-center gap-1">
              <CalendarIcon size="small" />
              <span>{formatSessionDateTime(session.startTime)}</span>
            </span>
          </div>
        </div>
        <div className="w-[45%] shrink-0">
          <Thumbnail
            src={session.imageUrl}
            alt={session.title}
            radius="lg"
            className="aspect-auto! h-51.75"
          />
        </div>
      </div>

      <div className="px-lg py-lg rounded-lg bg-gray-900">
        <p className="text-common-white text-base font-semibold">공지사항</p>
        <p className="mt-sm text-base font-semibold text-gray-400">{session.notice}</p>
      </div>

      <div className="gap-lg flex">
        <div className="px-lg py-lg flex flex-1 items-center justify-between rounded-lg bg-gray-900">
          <div className="flex flex-col gap-1">
            <p className="text-base font-semibold text-gray-50">To do 달성도 범위 기준</p>
            <p className="text-base text-gray-500">해당 달성도의 사용자만 참여할 수 있어요</p>
          </div>
          <div className="flex w-50 shrink-0 flex-col items-end gap-1">
            <span className="text-common-white text-[15px] font-bold">
              {requiredAchievementRate}%
            </span>
            <ProgressBar progress={requiredAchievementRate} indicatorClassName="bg-green-600" />
          </div>
        </div>
        <div className="px-lg py-lg flex flex-1 items-center justify-between rounded-lg bg-gray-900">
          <div className="flex flex-col gap-1">
            <p className="text-base font-semibold text-gray-50">세션 집중도 범위 기준</p>
            <p className="text-base text-gray-500">해당 집중도의 사용자만 참여할 수 있어요</p>
          </div>
          <div className="flex w-50 shrink-0 flex-col items-end gap-1">
            <span className="text-common-white text-[15px] font-bold">{requiredFocusRate}%</span>
            <ProgressBar progress={requiredFocusRate} indicatorClassName="bg-green-600" />
          </div>
        </div>
      </div>
    </section>
  );
}
