"use client";

import { useState } from "react";

import { PaginationList } from "@/components/Pagination/PaginationList";
import ReportCard from "@/components/ReportCard/ReportCard";
import SectionTitle from "@/components/ReportCard/SectionTitle";

import SessionHistoryCard from "./SessionHistoryCard";

interface SessionHistory {
  title: string;
  category: string;
  currentCount: number;
  maxCapacity: number;
  durationTime?: number;
  durationMinutes?: number;
  startTime: string;
  focusedTime: number;
  focusRate: number;
  todoCompletionRate: number;
}

const MOCK_SESSIONS: SessionHistory[] = [
  {
    title: "React 스터디 세션",
    category: "DEVELOPMENT",
    currentCount: 6,
    maxCapacity: 10,
    durationTime: 3600,
    startTime: "2026-02-20T14:00:00",
    focusedTime: 2912,
    focusRate: 20,
    todoCompletionRate: 100,
  },
  {
    title: "Java 스터디 세션",
    category: "DEVELOPMENT",
    currentCount: 6,
    maxCapacity: 10,
    durationMinutes: 60,
    startTime: "2026-02-16T14:00:00",
    focusedTime: 2912,
    focusRate: 20,
    todoCompletionRate: 100,
  },
];

export default function SessionHistorySection() {
  const [expandedIndexes, setExpandedIndexes] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const toggleExpand = (index: number) => {
    setExpandedIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <ReportCard className="gap-xl">
      <SectionTitle>지금까지 참여한 세션</SectionTitle>

      <div className="gap-lg flex flex-col">
        {MOCK_SESSIONS.map((session, index) => (
          <SessionHistoryCard
            key={index}
            session={session}
            isExpanded={expandedIndexes.includes(index)}
            onToggle={() => toggleExpand(index)}
          />
        ))}
      </div>

      <div className="py-3xl flex w-full justify-center">
        <PaginationList totalPage={5} currentPage={currentPage} onPageChange={setCurrentPage} />
      </div>
    </ReportCard>
  );
}
