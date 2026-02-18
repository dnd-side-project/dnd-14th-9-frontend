"use client";

import { Thumbnail } from "@/components/Thumbnail/Thumbnail";
import { CardMeta } from "@/features/session/components/Card/CardMeta";

const MOCK_SESSION = {
  title: "프론트엔드 스터디",
  summary: "React와 Next.js를 함께 공부하는 세션입니다",
  thumbnailUrl: null,
  currentParticipants: 3,
  maxParticipants: 6,
  durationMinutes: 90,
  startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
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
    </section>
  );
}
