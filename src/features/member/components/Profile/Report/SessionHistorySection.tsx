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
  const [expandedSessionIds, setExpandedSessionIds] = useState<string[]>([]);

  const toggleExpand = (sessionId: string) => {
    setExpandedSessionIds((prev) =>
      prev.includes(sessionId) ? prev.filter((id) => id !== sessionId) : [...prev, sessionId]
    );
  };

  return (
    <ReportCard className="gap-xl">
      <SectionTitle>지금까지 참여한 세션</SectionTitle>

      <div className="gap-lg flex flex-col">
        {items.map((session) => (
          <SessionHistoryCard
            key={session.sessionId}
            session={session}
            isExpanded={expandedSessionIds.includes(session.sessionId)}
            onToggle={() => toggleExpand(session.sessionId)}
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
