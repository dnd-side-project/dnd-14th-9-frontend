import type { ComponentProps } from "react";

import { Pagination } from "@/components/Pagination/Pagination";

import { SessionCardItem } from "./SessionCardItem";
import { SessionListErrorState } from "./SessionListErrorState";
import { SessionListFilterBar } from "./SessionListFilterBar";

import type { SessionListItem } from "../../types";

type SessionListFilterBarProps = ComponentProps<typeof SessionListFilterBar>;

interface SessionListViewProps {
  filterBarProps: SessionListFilterBarProps;
  sessions: SessionListItem[];
  totalPage: number;
  currentPage: number;
  isError: boolean;
  onRetry: () => void;
  onPageChange: (page: number) => void;
  onShareSession: (sessionId: number) => void;
}

export function SessionListView({
  filterBarProps,
  sessions,
  totalPage,
  currentPage,
  isError,
  onRetry,
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
          <SessionListFilterBar {...filterBarProps} />
        </div>
      </div>

      {isError ? (
        <SessionListErrorState onRetry={onRetry} />
      ) : sessions.length === 0 ? (
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

      {!isError && totalPage > 0 && (
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
