"use client";

import { useCallback } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { PaginationList } from "@/components/Pagination/PaginationList";

import { useSessionList } from "../../hooks/useSessionHooks";
import { Card } from "../Card/Card";

import { RecruitingFilterBar } from "./RecruitingFilterBar";

import type { DurationRange, SessionSort, SessionCategoryFilter, TimeSlot } from "../../types";

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
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL 파라미터 파싱
  const keyword = searchParams.get("q") ?? undefined;
  const category = (searchParams.get("category") as SessionCategoryFilter) ?? undefined;
  const sort = (searchParams.get("sort") as SessionSort) ?? "LATEST";
  const page = Number(searchParams.get("page") ?? "1");

  // 추가 필터 파라미터
  const startDate = searchParams.get("startDate") ?? undefined;
  const endDate = searchParams.get("endDate") ?? undefined;

  // TODO(장근호): 타입 단언(as ...) 보다는 타입 가드나 유효성 검사 필요
  const timeSlotParam = searchParams.get("timeSlots");
  const timeSlots = timeSlotParam ? [timeSlotParam as TimeSlot] : undefined;

  const durationRange = (searchParams.get("durationRange") as DurationRange | null) ?? undefined;
  const participants = searchParams.get("participants")
    ? Number(searchParams.get("participants"))
    : undefined;

  const { data, isPending } = useSessionList({
    keyword,
    category,
    sort,
    page,
    size: DEFAULT_PAGE_SIZE,
    startDate,
    endDate,
    timeSlots,
    durationRange,
    participants,
  });

  const updateSearchParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      const queryString = params.toString();
      router.push(queryString ? `?${queryString}` : "/", { scroll: false });
    },
    [router, searchParams]
  );

  const handleSortChange = useCallback(
    (newSort: string) => {
      updateSearchParams({ sort: newSort, page: null });
    },
    [updateSearchParams]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      updateSearchParams({ page: newPage === 1 ? null : String(newPage) });
    },
    [updateSearchParams]
  );

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
          <RecruitingFilterBar sort={sort} onSortChange={handleSortChange} />
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
          <PaginationList
            totalPage={totalPage}
            currentPage={page}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </section>
  );
}
