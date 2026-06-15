import type { ComponentProps } from "react";

import { Pagination } from "@/components/Pagination/Pagination";

import { SessionListContent } from "./SessionListContent";
import { SessionListFilterBar } from "./SessionListFilterBar";

import type { SessionListItem } from "../../types";

type SessionListFilterBarProps = ComponentProps<typeof SessionListFilterBar>;

interface SessionListViewProps {
  filterBarProps: SessionListFilterBarProps;
  sessions: SessionListItem[];
  totalPage: number;
  currentPage: number;
  isError: boolean;
  isLoading: boolean;
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
  isLoading,
  onRetry,
  onPageChange,
  onShareSession,
}: SessionListViewProps) {
  const shouldShowPagination = !isError && totalPage > 0;

  return (
    <section className="gap-lg flex flex-col">
      <div className="flex flex-col gap-2.5">
        <h2 className="text-text-primary text-lg font-bold md:text-2xl">지금 모집 중인 세션</h2>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-5">
          <p className="text-text-muted text-[13px] md:text-base">
            현재 모집 중인 세션에 바로 참여해 보세요
          </p>
          <SessionListFilterBar {...filterBarProps} />
        </div>
      </div>

      <SessionListContent
        sessions={sessions}
        isError={isError}
        isLoading={isLoading}
        onRetry={onRetry}
        onShareSession={onShareSession}
      />

      {shouldShowPagination && (
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
