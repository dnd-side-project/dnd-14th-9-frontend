"use client";

import { ProgressBar } from "@/components/ProgressBar/ProgressBar";
import { ProgressRing } from "@/components/ProgressRing/ProgressRing";

interface FocusStatusItemProps {
  focusedTime: number;
  totalParticipationTime: number;
  completedTodoCount: number;
  totalTodoCount: number;
}

export function FocusStatusItem({
  focusedTime,
  totalParticipationTime,
  completedTodoCount,
  totalTodoCount,
}: FocusStatusItemProps) {
  const focusPercentage =
    totalParticipationTime > 0 ? (focusedTime / totalParticipationTime) * 100 : 0;
  const todoPercentage = totalTodoCount > 0 ? (completedTodoCount / totalTodoCount) * 100 : 0;

  return (
    <div className="p-lg gap-md border-border-subtle bg-surface-strong flex flex-col rounded-md border">
      <div className="flex items-center justify-between">
        <div className="gap-2xs flex h-[56px] w-[241px] flex-col items-start">
          <p className="text-text-primary text-xs font-semibold">집중도</p>
          <p className="text-text-brand-subtle text-lg leading-[1.4]">
            <span className="font-bold">총 {focusedTime}분 </span>
            <span className="text-text-muted text-sm font-semibold">
              / {totalParticipationTime}분
            </span>
          </p>
        </div>
        <div className="py-md flex h-[56px] w-[56px] shrink-0 items-center justify-center px-[13px]">
          <ProgressRing
            progress={focusPercentage}
            size={56}
            strokeWidth={2.8}
            trackClassName="stroke-border-inverse"
            progressClassName="stroke-text-brand-subtle"
          >
            <span className="text-text-brand-subtle text-sm font-semibold">
              {Math.round(focusPercentage)}%
            </span>
          </ProgressRing>
        </div>
      </div>

      {/* Divider replacement */}
      <div className="bg-surface-subtler h-px w-full" />

      <div className="gap-2xs flex flex-col">
        <p className="text-text-primary text-xs font-semibold">투두 달성률</p>

        <div className="gap-xs flex flex-col">
          <div className="flex w-full items-center justify-between">
            <span className="text-text-brand-default text-lg font-semibold">
              {Math.round(todoPercentage)}%
            </span>
            <span className="text-text-muted text-xs font-semibold">
              {completedTodoCount}/{totalTodoCount}
            </span>
          </div>

          <div className="relative w-full">
            <ProgressBar
              progress={todoPercentage}
              className="bg-border-default h-1"
              indicatorClassName="bg-border-primary-default"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
