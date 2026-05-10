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

  if (sessions.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-text-muted text-sm">
          {emptyMessage ?? "해당 카테고리에 모집 중인 세션이 없습니다"}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: 가로 스크롤 (스크롤바 숨김 + 우측 fade overlay) */}
      <div className="relative md:hidden">
        <div className="scrollbar-hide flex gap-6 overflow-x-auto pb-1">
          {sessions.map((session) => (
            <div key={session.sessionId} className="w-[226px] shrink-0">
              <Link href={`/session/${session.sessionId}`} scroll={false} className="block">
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
            </div>
          ))}
        </div>
        {/* 우측 fade overlay */}
        <div
          aria-hidden="true"
          className="from-surface-default pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l to-transparent"
        />
      </div>

      {/* Tablet / Desktop: 일반 grid */}
      <div className="hidden min-h-[300px] grid-cols-2 gap-6 md:grid xl:grid-cols-4 xl:gap-y-[48px]">
        {sessions.map((session) => (
          <div key={session.sessionId} className="mx-auto w-full xl:max-w-69">
            <Link href={`/session/${session.sessionId}`} scroll={false} className="block">
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
          </div>
        ))}
      </div>
    </>
  );
}
