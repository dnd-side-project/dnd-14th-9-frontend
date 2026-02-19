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
    <div className="border-color-default gap-xl flex h-[200px] w-full flex-col rounded-md border px-4 py-6">
      <div className="gap-sm flex w-full flex-col">
        <div className="flex w-full items-center gap-[9px]">
          <div className="gap-2xs flex h-[56px] w-[241px] flex-col items-start">
            <p className="font-pretendard text-text-disabled text-sm font-semibold">집중도</p>
            <p className="font-pretendard text-text-brand-subtle text-lg leading-[1.4]">
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
              progressClassName="text-text-brand-subtle"
            >
              <span className="font-pretendard text-text-brand-subtle text-sm font-semibold">
                {Math.round(focusPercentage)}%
              </span>
            </ProgressRing>
          </div>
        </div>
        <div className="bg-surface-subtler h-px w-full" /> {/* Divider replacement */}
        <div className="flex w-full items-center justify-center gap-4">
          <div className="gap-xs flex w-full flex-col items-center">
            <div className="font-pretendard text-text-disabled flex w-full items-center justify-between text-sm font-semibold">
              <span>To do 달성도</span>
            </div>

            <div className="gap-xs px-xs flex w-full flex-col">
              <div className="flex w-full items-center justify-between">
                <span className="font-pretendard text-text-brand-subtle text-[15px] font-bold">
                  {Math.round(todoPercentage)}%
                </span>
                <span className="font-pretendard text-text-muted text-xs font-semibold">
                  {completedTodoCount}/{totalTodoCount}
                </span>
              </div>

              <div className="relative w-full">
                <ProgressBar
                  progress={todoPercentage}
                  className="bg-surface-subtler h-1.5"
                  indicatorClassName="bg-surface-primary-subtler"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
