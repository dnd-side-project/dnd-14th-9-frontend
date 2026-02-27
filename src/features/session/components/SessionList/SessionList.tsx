"use client";

import { useEffect } from "react";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { ShareIcon } from "@/components/Icon/ShareIcon";
import { PaginationList } from "@/components/Pagination/PaginationList";

import { SESSION_LIST_PAGE_SIZE } from "../../constants/pagination";
import { useSuspenseSessionList } from "../../hooks/useSessionHooks";
import { useSessionListFilters } from "../../hooks/useSessionListFilters";
import { useShareSession } from "../../hooks/useShareSession";
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
  const { shareSession } = useShareSession();

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
          <p className="text-text-disabled text-base">현재 모집 중인 세션에 바로 참여해 보세요</p>
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
            <div key={session.sessionId} className="relative">
              <Link href={`/session/${session.sessionId}`} scroll={false}>
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
              <button
                type="button"
                className="bg-surface-default/80 hover:bg-surface-default absolute top-2 right-2 flex cursor-pointer items-center justify-center rounded-full p-1.5 backdrop-blur-sm transition-colors"
                onClick={() => shareSession(session.sessionId)}
                aria-label="세션 링크 복사"
              >
                <ShareIcon size="small" className="text-text-secondary" />
              </button>
            </div>
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
