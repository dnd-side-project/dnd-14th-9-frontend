import { Pagination } from "@/components/Pagination/Pagination";

import { SessionCardItem } from "./SessionCardItem";
import { SessionListFilterBar } from "./SessionListFilterBar";

import type { SessionListFilterValues } from "../../hooks/useSessionListFilters";
import type { DurationRange, SessionListItem, SessionSort, TimeSlot } from "../../types";

interface SessionListViewProps {
  values: SessionListFilterValues;
  sessions: SessionListItem[];
  totalPage: number;
  currentPage: number;
  onSetDateRange: (startDate: Date | null, endDate: Date | null) => void;
  onToggleTimeSlot: (timeSlot: TimeSlot) => void;
  onSetDurationRange: (durationRange: DurationRange) => void;
  onSetParticipants: (participants: number) => void;
  onSetSort: (sort: SessionSort) => void;
  onResetFilters: () => void;
  onPageChange: (page: number) => void;
  onShareSession: (sessionId: number) => void;
}

export function SessionListView({
  values,
  sessions,
  totalPage,
  currentPage,
  onSetDateRange,
  onToggleTimeSlot,
  onSetDurationRange,
  onSetParticipants,
  onSetSort,
  onResetFilters,
  onPageChange,
  onShareSession,
}: SessionListViewProps) {
  return (
    <section className="gap-lg flex flex-col">
      <div className="flex flex-col gap-[10px]">
        <h2 className="text-text-primary text-lg font-bold md:text-2xl">지금 모집 중인 세션</h2>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-5">
          <p className="text-text-muted text-[13px] md:text-base">
            현재 모집 중인 세션에 바로 참여해 보세요
          </p>
          <SessionListFilterBar
            values={values}
            onSetDateRange={onSetDateRange}
            onToggleTimeSlot={onToggleTimeSlot}
            onSetDurationRange={onSetDurationRange}
            onSetParticipants={onSetParticipants}
            onSetSort={onSetSort}
            onResetFilters={onResetFilters}
          />
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="text-text-muted flex h-60 items-center justify-center text-sm">
          모집 중인 세션이 없습니다
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 xl:gap-y-[48px]">
          {sessions.map((session) => (
            <SessionCardItem key={session.sessionId} session={session} onShare={onShareSession} />
          ))}
        </div>
      )}

      {totalPage > 0 && (
        <div className="py-3xl flex justify-center">
          <Pagination
            type="list"
            totalPage={totalPage}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </section>
  );
}
