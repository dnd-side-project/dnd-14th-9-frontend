"use client";

import { useState, useTransition } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { Pagination } from "@/components/Pagination/Pagination";
import SectionTitle from "@/components/ReportCard/SectionTitle";
import type { SessionHistoryItem, SessionHistoryPagination } from "@/features/member/types";
import { cn } from "@/lib/utils/utils";

import SessionHistoryCard from "./SessionHistoryCard";

interface SessionHistorySectionProps {
  items: SessionHistoryItem[];
  pagination: SessionHistoryPagination;
}

export default function SessionHistorySection({ items, pagination }: SessionHistorySectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  // 페이지가 바뀌면 펼침 상태 초기화 (React 권장: 렌더 중 조정, 인덱스 재사용 오펼침 방지)
  const [prevPage, setPrevPage] = useState(pagination.currentPage);
  if (prevPage !== pagination.currentPage) {
    setPrevPage(pagination.currentPage);
    setExpandedIndex(null);
  }

  const toggleExpand = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="gap-sm md:gap-md lg:gap-xl flex flex-1 flex-col">
      <SectionTitle>지금까지 참여한 세션</SectionTitle>

      {items.length === 0 ? (
        <p className="text-text-tertiary py-20 text-center text-sm">아직 참여한 세션이 없어요.</p>
      ) : (
        <div
          className={cn(
            "gap-sm md:gap-md lg:gap-xl flex flex-col",
            isPending && "pointer-events-none"
          )}
          aria-busy={isPending}
        >
          <div className="gap-sm md:gap-lg flex flex-col">
            {items.map((session, index) => (
              <SessionHistoryCard
                key={`${session.sessionId}-${index}`}
                session={session}
                isExpanded={expandedIndex === index}
                onToggle={() => toggleExpand(index)}
              />
            ))}
          </div>

          <div className="py-xl md:py-3xl flex w-full justify-center">
            <Pagination
              type="list"
              totalPage={pagination.totalPage}
              currentPage={pagination.currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}
