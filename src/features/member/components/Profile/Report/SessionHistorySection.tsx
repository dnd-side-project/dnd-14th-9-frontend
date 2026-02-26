"use client";

import { useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { PaginationList } from "@/components/Pagination/PaginationList";
import ReportCard from "@/components/ReportCard/ReportCard";
import SectionTitle from "@/components/ReportCard/SectionTitle";
import type { SessionHistoryItem, SessionHistoryPagination } from "@/features/member/types";

import SessionHistoryCard from "./SessionHistoryCard";

interface SessionHistorySectionProps {
  items: SessionHistoryItem[];
  pagination: SessionHistoryPagination;
}

export default function SessionHistorySection({ items, pagination }: SessionHistorySectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <ReportCard className="gap-xl">
      <SectionTitle>지금까지 참여한 세션</SectionTitle>

      {items.length === 0 ? (
        <p className="text-text-tertiary py-20 text-center text-sm">아직 참여한 세션이 없어요.</p>
      ) : (
        <>
          <div className="gap-lg flex flex-col">
            {items.map((session, index) => (
              <SessionHistoryCard
                key={`${session.sessionId}-${index}`}
                session={session}
                isExpanded={expandedIndex === index}
                onToggle={() => toggleExpand(index)}
              />
            ))}
          </div>

          <div className="py-3xl flex w-full justify-center">
            <PaginationList
              totalPage={pagination.totalPage}
              currentPage={pagination.currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </ReportCard>
  );
}
