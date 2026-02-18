"use client";

import { CalendarIcon } from "@/components/Icon/CalendarIcon";
import { ClockIcon } from "@/components/Icon/ClockIcon";
import { UsersIcon } from "@/components/Icon/UsersIcon";
import { ProgressBar } from "@/components/ProgressBar/ProgressBar";
import { Thumbnail } from "@/components/Thumbnail/Thumbnail";
import { formatSessionDateTime } from "@/lib/utils/date";
import { formatParticipantCount, formatSessionDuration } from "@/lib/utils/format";

const MOCK_SESSION = {
  title: "프론트엔드 스터디",
  summary: "React와 Next.js를 함께 공부하는 세션입니다",
  notice: "세션 시작 10분 전까지 입장해주세요. 카메라는 필수입니다.",
  thumbnailUrl: null,
  currentParticipants: 3,
  maxParticipants: 6,
  durationMinutes: 90,
  startTime: "2025-12-31T23:59:59.000Z",
  requiredAchievementRate: 70,
  requiredFocusRate: 80,
};

export function SessionInfoCard() {
  return (
    <section className="gap-lg p-lg border-gray flex flex-col rounded-lg border">
      <div className="gap-lg flex">
        <div className="gap-sm flex flex-1 flex-col">
          <h2 className="text-[24px] font-bold text-gray-50">{MOCK_SESSION.title}</h2>
          <p className="text-[16px] text-gray-200">{MOCK_SESSION.summary}</p>
          <div className="flex items-center gap-4 text-[16px] text-gray-400">
            <span className="flex items-center gap-1">
              <UsersIcon size="small" />
              <span>
                {formatParticipantCount(
                  MOCK_SESSION.currentParticipants,
                  MOCK_SESSION.maxParticipants
                )}
              </span>
            </span>
            <span className="flex items-center gap-1">
              <ClockIcon size="small" />
              <span>{formatSessionDuration(MOCK_SESSION.durationMinutes)}</span>
            </span>
            <span className="flex items-center gap-1">
              <CalendarIcon size="small" />
              <span>{formatSessionDateTime(MOCK_SESSION.startTime)}</span>
            </span>
          </div>
        </div>
        <div className="w-[45%] shrink-0">
          <Thumbnail
            src={MOCK_SESSION.thumbnailUrl}
            alt={MOCK_SESSION.title}
            radius="lg"
            className="aspect-auto! h-51.75"
          />
        </div>
      </div>

      <div className="px-lg py-lg rounded-lg bg-gray-900">
        <p className="text-common-white text-[16px] font-semibold">공지사항</p>
        <p className="mt-sm text-[16px] font-semibold text-gray-400">{MOCK_SESSION.notice}</p>
      </div>

      <div className="gap-lg flex">
        <div className="px-lg py-lg flex flex-1 items-center justify-between rounded-lg bg-gray-900">
          <div className="flex flex-col gap-1">
            <p className="text-[16px] font-semibold text-gray-50">To do 달성도 범위 기준</p>
            <p className="text-[16px] text-gray-500">해당 달성도의 사용자만 참여할 수 있어요</p>
          </div>
          <div className="flex w-50 shrink-0 flex-col items-end gap-1">
            <span className="text-common-white text-[15px] font-bold">
              {MOCK_SESSION.requiredAchievementRate}%
            </span>
            <ProgressBar
              progress={MOCK_SESSION.requiredAchievementRate}
              indicatorClassName="bg-green-600"
            />
          </div>
        </div>
        <div className="px-lg py-lg flex flex-1 items-center justify-between rounded-lg bg-gray-900">
          <div className="flex flex-col gap-1">
            <p className="text-[16px] font-semibold text-gray-50">세션 집중도 범위 기준</p>
            <p className="text-[16px] text-gray-500">해당 집중도의 사용자만 참여할 수 있어요</p>
          </div>
          <div className="flex w-50 shrink-0 flex-col items-end gap-1">
            <span className="text-common-white text-[15px] font-bold">
              {MOCK_SESSION.requiredFocusRate}%
            </span>
            <ProgressBar
              progress={MOCK_SESSION.requiredFocusRate}
              indicatorClassName="bg-green-600"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
