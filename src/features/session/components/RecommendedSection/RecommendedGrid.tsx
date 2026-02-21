"use client";

import Link from "next/link";

import type { Category } from "@/lib/constants/category";

import { useSuspenseSessionList } from "../../hooks/useSessionHooks";
import { Card } from "../Card/Card";

interface RecommendedGridProps {
  category: Category;
}

export function RecommendedGrid({ category }: RecommendedGridProps) {
  const { data } = useSuspenseSessionList({ category, size: 4 });
  const sessions = data.result.sessions;
  const gridClassName = "gap-md grid min-h-[300px] grid-cols-4";

  if (sessions.length === 0) {
    return (
      <div className={gridClassName}>
        <div className="text-text-muted col-span-4 flex items-center justify-center text-sm">
          해당 카테고리에 모집 중인 세션이 없습니다
        </div>
      </div>
    );
  }

  return (
    <div className={gridClassName}>
      {sessions.map((session) => (
        <Link key={session.sessionId} href={`/session/${session.sessionId}`}>
          <Card
            thumbnailSrc={session.imageUrl}
            category={session.category}
            createdAt={session.startTime}
            title={session.title}
            nickname={session.hostNickname}
            currentParticipants={session.currentParticipants}
            maxParticipants={session.maxParticipants}
            durationMinutes={session.sessionDurationMinutes}
            sessionDate={session.startTime}
          />
        </Link>
      ))}
    </div>
  );
}
