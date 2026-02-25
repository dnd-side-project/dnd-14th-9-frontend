"use client";

import { useEffect } from "react";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { PaginationList } from "@/components/Pagination/PaginationList";

import { SESSION_LIST_PAGE_SIZE } from "../../constants/pagination";
import { useSuspenseSessionList } from "../../hooks/useSessionHooks";
import { useSessionListFilters } from "../../hooks/useSessionListFilters";
import { parseSessionListSearchParams } from "../../utils/parseSessionListSearchParams";
import { Card } from "../Card/Card";

import { SessionListFilterBar } from "./SessionListFilterBar";

/**
 * SessionList - 모집 중 세션 목록
 *
 * 역할:
 * - URL searchParams 기반 필터링/페이지네이션
 * - SearchFilterSection의 검색어/카테고리 변경에 반응
 * - 정렬 드롭다운 + 카드 그리드 + PaginationList
 */
export function SessionList() {
  const {
    values,
    setDateRange,
    toggleTimeSlot,
    setDurationRange,
    setParticipantsCount,
    setSort,
    setPage,
    resetFilters,
  } = useSessionListFilters();
  const searchParams = useSearchParams();

  // URL 파라미터 파싱
  const { keyword, category, page } = parseSessionListSearchParams(searchParams);

  const { data } = useSuspenseSessionList({
    keyword,
    category,
    sort: values.sort,
    page,
    size: SESSION_LIST_PAGE_SIZE,
    startDate: values.startDate ?? undefined,
    endDate: values.endDate ?? undefined,
    timeSlots: values.timeSlots.length > 0 ? values.timeSlots : undefined,
    durationRange: values.durationRange ?? undefined,
    participants: values.participants ? Number(values.participants) : undefined,
  });

  const sessions = data.result.sessions;
  const totalPage = data.result.totalPage;

  useEffect(() => {
    if (totalPage > 0 && page > totalPage) {
      setPage(totalPage);
    }
  }, [page, setPage, totalPage]);

  return (
    <section className="gap-lg flex flex-col">
      <div className="flex flex-col gap-[10px]">
        <h2 className="text-text-primary text-2xl font-bold">지금 모집 중인 세션</h2>
        <div className="flex justify-between">
          <p className="text-text-disabled text-base">
            마이페이지에서 설정한 카테고리를 기반해서 방을 추천해드려요
          </p>
          <SessionListFilterBar
            values={values}
            onSetDateRange={setDateRange}
            onToggleTimeSlot={toggleTimeSlot}
            onSetDurationRange={setDurationRange}
            onSetParticipants={setParticipantsCount}
            onSetSort={setSort}
            onResetFilters={resetFilters}
          />
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="text-text-muted flex h-60 items-center justify-center text-sm">
          모집 중인 세션이 없습니다
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-x-[24px] gap-y-[48px]">
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
      )}

      {totalPage > 0 && (
        <div className="py-3xl flex justify-center">
          <PaginationList totalPage={totalPage} currentPage={page} onPageChange={setPage} />
        </div>
      )}
    </section>
  );
}
