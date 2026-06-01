"use client";

import { useEffect } from "react";

import { useSearchParams } from "next/navigation";

import { useViewportLayout } from "@/hooks/useViewportLayout";

import {
  SESSION_LIST_DESKTOP_PAGE_SIZE,
  SESSION_LIST_MOBILE_PAGE_SIZE,
} from "../../constants/pagination";
import { useSessionListQuery } from "../../hooks/useSessionHooks";
import { useSessionListFilters } from "../../hooks/useSessionListFilters";
import { useShareSession } from "../../hooks/useShareSession";
import { parseSessionListSearchParams } from "../../utils/parseSessionListSearchParams";

import { SessionListSkeleton } from "./SessionListSkeleton";
import { SessionListView } from "./SessionListView";

function useResponsiveSessionListPageSize() {
  const { layout, isResolved } = useViewportLayout();
  const pageSize =
    layout === "mobile" ? SESSION_LIST_MOBILE_PAGE_SIZE : SESSION_LIST_DESKTOP_PAGE_SIZE;

  return { pageSize, isViewportResolved: isResolved };
}

/**
 * SessionList - 모집 중 세션 목록 데이터 컨테이너
 *
 * 역할:
 * - URL searchParams 기반 필터링/페이지네이션
 * - viewport 확정 이후 실제 화면 크기에 맞는 page size로 세션 목록 요청
 * - 요청 상태에 따른 skeleton/error 처리
 * - 실제 렌더링은 SessionListView에 위임
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
  const { pageSize, isViewportResolved } = useResponsiveSessionListPageSize();

  const { keyword, category, page } = parseSessionListSearchParams(searchParams);

  const { data, isPending, isError, refetch } = useSessionListQuery(
    {
      keyword,
      category,
      sort: values.sort,
      page,
      size: pageSize,
      startDate: values.startDate ?? undefined,
      endDate: values.endDate ?? undefined,
      timeSlots: values.timeSlots.length > 0 ? values.timeSlots : undefined,
      durationRange: values.durationRange ?? undefined,
      participants: values.participants ? Number(values.participants) : undefined,
    },
    { enabled: isViewportResolved }
  );

  const totalPage = data?.result.totalPage ?? 0;

  useEffect(() => {
    if (isViewportResolved && totalPage > 0 && page > totalPage) {
      setPage(totalPage);
    }
  }, [isViewportResolved, page, setPage, totalPage]);

  if (!isViewportResolved || isPending) {
    return <SessionListSkeleton />;
  }

  const sessions = data?.result.sessions ?? [];

  return (
    <SessionListView
      values={values}
      sessions={sessions}
      totalPage={totalPage}
      currentPage={page}
      onSetDateRange={setDateRange}
      onToggleTimeSlot={toggleTimeSlot}
      onSetDurationRange={setDurationRange}
      onSetParticipants={setParticipantsCount}
      onSetSort={setSort}
      onResetFilters={resetFilters}
      isError={isError}
      onRetry={() => void refetch()}
      onPageChange={setPage}
      onShareSession={shareSession}
    />
  );
}
