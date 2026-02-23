"use client";

import { useEffect } from "react";

import Link from "next/link";

import type { Category } from "@/lib/constants/category";

import { useSuspenseSessionList } from "../../hooks/useSessionHooks";
import { Card } from "../Card/Card";

import type { DurationRange, TimeSlot } from "../../types";

interface RecommendedGridProps {
  category?: Category;
  keyword?: string;
  filters?: {
    startDate?: string;
    endDate?: string;
    timeSlots?: TimeSlot[];
    durationRange?: DurationRange;
    participants?: number;
  };
  page?: number;
  onMetaChange?: (meta: { totalPage: number }) => void;
  emptyMessage?: string;
}

export function RecommendedGrid({
  category,
  keyword,
  filters,
  page = 1,
  onMetaChange,
  emptyMessage,
}: RecommendedGridProps) {
  const { data } = useSuspenseSessionList({
    category,
    keyword,
    sort: keyword ? "DEADLINE_APPROACHING" : undefined,
    startDate: filters?.startDate,
    endDate: filters?.endDate,
    timeSlots: filters?.timeSlots,
    durationRange: filters?.durationRange,
    participants: filters?.participants,
    page,
    size: 4,
  });

  const totalPage = data.result.totalPage;

  useEffect(() => {
    onMetaChange?.({ totalPage });
  }, [totalPage, onMetaChange]);
  const sessions = data.result.sessions;
  const gridClassName = "gap-md grid min-h-[300px] grid-cols-4";

  if (sessions.length === 0) {
    return (
      <div className={gridClassName}>
        <div className="text-text-muted col-span-4 flex items-center justify-center text-sm">
          {emptyMessage ?? "해당 카테고리에 모집 중인 세션이 없습니다"}
        </div>
      </div>
    );
  }

  return (
    <div className={gridClassName}>
      {sessions.map((session) => (
        <Link key={session.sessionId} href={`/session/${session.sessionId}/preview`}>
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
