"use client";

import { useState } from "react";

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
  const [expandedIndexes, setExpandedIndexes] = useState<number[]>([]);

  const toggleExpand = (index: number) => {
    setExpandedIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <ReportCard className="gap-xl">
      <SectionTitle>지금까지 참여한 세션</SectionTitle>

      <div className="gap-lg flex flex-col">
        {items.map((session, index) => (
          <SessionHistoryCard
            key={session.sessionId}
            session={session}
            isExpanded={expandedIndexes.includes(index)}
            onToggle={() => toggleExpand(index)}
          />
        ))}
      </div>

      <div className="py-3xl flex w-full justify-center">
        <PaginationList
          totalPage={pagination.totalPages}
          currentPage={pagination.currentPage}
          onPageChange={() => {}}
        />
      </div>
    </ReportCard>
  );
}
