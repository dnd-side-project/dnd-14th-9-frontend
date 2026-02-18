"use client";

import { ProgressBar } from "@/components/ProgressBar/ProgressBar";
import { Thumbnail } from "@/components/Thumbnail/Thumbnail";
import { CardMeta } from "@/features/session/components/Card/CardMeta";

const MOCK_SESSION = {
  title: "프론트엔드 스터디",
  summary: "React와 Next.js를 함께 공부하는 세션입니다",
  notice: "세션 시작 10분 전까지 입장해주세요. 카메라는 필수입니다.",
  thumbnailUrl: null,
  currentParticipants: 3,
  maxParticipants: 6,
  durationMinutes: 90,
  startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  requiredAchievementRate: 70,
  requiredFocusRate: 80,
};

export function SessionInfoCard() {
  return (
    <section className="gap-lg p-lg border-gra flex flex-col rounded-lg border">
      <div className="gap-lg flex">
        <div className="gap-sm flex flex-1 flex-col">
          <h2 className="text-text-primary text-lg font-bold">{MOCK_SESSION.title}</h2>
          <p className="text-text-muted text-sm">{MOCK_SESSION.summary}</p>
          <CardMeta
            currentParticipants={MOCK_SESSION.currentParticipants}
            maxParticipants={MOCK_SESSION.maxParticipants}
            durationMinutes={MOCK_SESSION.durationMinutes}
            sessionDate={MOCK_SESSION.startTime}
          />
        </div>
        <div className="w-[45%] shrink-0">
          <Thumbnail src={MOCK_SESSION.thumbnailUrl} alt={MOCK_SESSION.title} radius="lg" />
        </div>
      </div>

      <div className="px-lg py-lg rounded-lg bg-gray-900">
        <p className="text-common-white text-[16px] font-semibold">공지사항</p>
        <p className="mt-sm text-[16px] font-semibold text-gray-400">{MOCK_SESSION.notice}</p>
      </div>

      <div className="gap-lg flex">
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-sm font-semibold text-gray-400">To do 달성도 범위 기준</p>
          <p className="text-xs text-gray-500">해당 달성도의 사용자만 참여할 수 있어요</p>
          <ProgressBar progress={MOCK_SESSION.requiredAchievementRate} />
          <span className="text-[15px] font-bold text-green-100">
            {MOCK_SESSION.requiredAchievementRate}%
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-sm font-semibold text-gray-400">세션 집중도 범위 기준</p>
          <p className="text-xs text-gray-500">해당 집중도의 사용자만 참여할 수 있어요</p>
          <ProgressBar progress={MOCK_SESSION.requiredFocusRate} />
          <span className="text-[15px] font-bold text-green-100">
            {MOCK_SESSION.requiredFocusRate}%
          </span>
        </div>
      </div>
    </section>
  );
}
