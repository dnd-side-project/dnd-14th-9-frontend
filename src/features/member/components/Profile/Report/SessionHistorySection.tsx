"use client";

import { useState } from "react";

import { Badge } from "@/components/Badge/Badge";
import { CalendarIcon } from "@/components/Icon/CalendarIcon";
import { ChevronDownIcon } from "@/components/Icon/ChevronDownIcon";
import { ClockIcon } from "@/components/Icon/ClockIcon";
import { UsersIcon } from "@/components/Icon/UsersIcon";
import { PaginationList } from "@/components/Pagination/PaginationList";
import ReportCard from "@/components/ReportCard/ReportCard";
import SectionTitle from "@/components/ReportCard/SectionTitle";
import { CategoryFilter, getCategoryLabel } from "@/lib/constants/category";
import { formatHHMMSS } from "@/lib/utils/format";
import { cn } from "@/lib/utils/utils";

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

const getDurationText = (session: SessionHistory) => {
  if (session.durationMinutes) return `${session.durationMinutes}분`;
  if (session.durationTime) return `${Math.floor(session.durationTime / 60)}분`;
  return "0분";
};

const formatStartDate = (dateString: string) => {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${month}/${day} · ${hours}:${minutes}`;
};

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
        {MOCK_SESSIONS.map((session, index) => {
          const isExpanded = expandedIndexes.includes(index);

          return (
            <div
              key={index}
              className="border-border-[var(--color-alpha-white-8)] bg-surface-strong flex cursor-pointer flex-col justify-center gap-[24px] rounded-[6px] border p-[24px]"
              onClick={() => toggleExpand(index)}
            >
              <div className="flex w-full items-start justify-between">
                <div className="gap-xs flex flex-col">
                  <p className="text-text-primary text-[16px] font-semibold">{session.title}</p>
                  <div className="gap-sm flex items-center">
                    <Badge radius="xs" className="border-0">
                      {getCategoryLabel(session.category as CategoryFilter)}
                    </Badge>
                    <div className="gap-xs flex">
                      <div className="gap-2xs text-text-secondary flex items-center justify-center">
                        <UsersIcon className="h-[12px] w-[12px]" />
                        <span className="text-[13px]">
                          {session.currentCount} / {session.maxCapacity}명
                        </span>
                      </div>
                      <div className="gap-2xs text-text-secondary flex items-center justify-center">
                        <ClockIcon className="h-[12px] w-[12px]" />
                        <span className="text-[13px]">{getDurationText(session)}</span>
                      </div>
                      <div className="gap-2xs text-text-secondary flex items-center justify-center">
                        <CalendarIcon className="h-[12px] w-[12px]" />
                        <span className="text-[13px]">{formatStartDate(session.startTime)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={cn(
                    "text-icon-secondary flex h-[24px] w-[24px] items-center justify-center transition-transform",
                    isExpanded && "rotate-180"
                  )}
                >
                  <ChevronDownIcon className="h-6 w-6" />
                </div>
              </div>

              {/* 위 태그 영역 클릭 시 아래로 노출 */}
              {isExpanded && (
                <div className="pt-md gap-3xl flex items-center border-t border-t-[var(--color-alpha-white-8)]">
                  <div className="gap-2xs flex flex-col">
                    <p className="text-text-secondary font-regular text-[15px]">집중 시간</p>
                    <p className="text-text-brand-default text-[13px] font-semibold">
                      {formatHHMMSS(session.focusedTime)}
                    </p>
                  </div>
                  <div className="gap-2xs flex flex-col">
                    <p className="text-text-secondary font-regular text-[15px]">집중률</p>
                    <p className="text-text-brand-default text-[13px] font-semibold">
                      {session.focusRate}%
                    </p>
                  </div>
                  <div className="gap-2xs flex flex-col">
                    <p className="text-text-secondary font-regular text-[15px]">투두 달성률</p>
                    <p className="text-text-brand-default text-[13px] font-semibold">
                      {session.todoCompletionRate}%
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="py-3xl flex w-full justify-center">
        <PaginationList totalPage={5} currentPage={currentPage} onPageChange={setCurrentPage} />
      </div>
    </ReportCard>
  );
}
