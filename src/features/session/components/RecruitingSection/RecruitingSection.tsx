"use client";

import { useSearchParams } from "next/navigation";

import { PaginationList } from "@/components/Pagination/PaginationList";

import { useRecruitingFilters } from "../../hooks/useRecruitingFilters";
import { useSessionList } from "../../hooks/useSessionHooks";
import { Card } from "../Card/Card";

import { RecruitingFilterBar } from "./RecruitingFilterBar";

import type { SessionCategoryFilter } from "../../types";

const DEFAULT_PAGE_SIZE = 12;

/**
 * RecruitingSection - 모집 중 세션 목록
 *
 * 역할:
 * - URL searchParams 기반 필터링/페이지네이션
 * - SearchFilterSection의 검색어/카테고리 변경에 반응
 * - 정렬 드롭다운 + 카드 그리드 + PaginationList
 */
export function RecruitingSection() {
  const {
    values,
    setDateRange,
    toggleTimeSlot,
    cycleDurationRange,
    cycleParticipants,
    toggleSort,
    setPage,
  } = useRecruitingFilters();
  const searchParams = useSearchParams();

  // URL 파라미터 파싱
  const keyword = searchParams.get("q") ?? undefined;
  const category = (searchParams.get("category") as SessionCategoryFilter) ?? undefined;
  const page = Number(searchParams.get("page") ?? "1");

  const { data, isPending } = useSessionList({
    keyword,
    category,
    sort: values.sort,
    page,
    size: DEFAULT_PAGE_SIZE,
    startDate: values.startDate ?? undefined,
    endDate: values.endDate ?? undefined,
    timeSlots: values.timeSlots.length > 0 ? values.timeSlots : undefined,
    durationRange: values.durationRange ?? undefined,
    participants: values.participants ? Number(values.participants) : undefined,
  });

  const sessions = data?.result?.sessions ?? [];
  const totalPage = data?.result?.totalPage ?? 0;

  return (
    <section className="flex flex-col gap-[10px]">
      <div className="flex flex-col gap-[10px]">
        <h2 className="text-text-primary text-2xl font-bold">지금 모집 중인 세션</h2>
        <div className="flex justify-between">
          <p className="text-text-disabled text-base">
            마이페이지에서 설정한 카테고리를 기반해서 방을 추천해드려요
          </p>
          <RecruitingFilterBar
            values={values}
            onSetDateRange={setDateRange}
            onToggleTimeSlot={toggleTimeSlot}
            onCycleDurationRange={cycleDurationRange}
            onCycleParticipants={cycleParticipants}
            onToggleSort={toggleSort}
          />
        </div>
      </div>

      {isPending ? (
        <div className="grid grid-cols-4 gap-x-[24px] gap-y-[48px]">
          {Array.from({ length: DEFAULT_PAGE_SIZE }).map((_, i) => (
            <div key={i} className="bg-surface-strong aspect-[320/170] animate-pulse rounded-lg" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-text-muted flex h-60 items-center justify-center text-sm">
          모집 중인 세션이 없습니다
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-x-[24px] gap-y-[48px]">
          {sessions.map((session) => (
            <Card
              key={session.title + session.startTime}
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
          ))}
        </div>
      )}

      {totalPage > 1 && (
        <div className="flex justify-center">
          <PaginationList totalPage={totalPage} currentPage={page} onPageChange={setPage} />
        </div>
      )}
    </section>
  );
}
