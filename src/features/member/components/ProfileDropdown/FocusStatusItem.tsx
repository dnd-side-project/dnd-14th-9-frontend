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
    <div className="border-color-default flex h-[200px] w-full flex-col gap-6 rounded-md border px-4 py-6">
      <div className="flex w-full flex-col gap-3">
        <div className="flex w-full items-center gap-[9px]">
          <div className="flex h-[56px] w-[241px] flex-col items-start gap-1">
            <p className="font-pretendard text-sm font-semibold text-gray-500">집중도</p>
            <p className="font-pretendard text-text-brand-subtle text-lg leading-[1.4]">
              <span className="font-bold">총 {focusedTime}분 </span>
              <span className="text-sm font-semibold text-gray-400">
                / {totalParticipationTime}분
              </span>
            </p>
          </div>
          <div className="flex h-[56px] w-[56px] shrink-0 items-center justify-center px-[13px] py-4">
            <ProgressRing
              progress={focusPercentage}
              size={56}
              strokeWidth={2.8}
              trackClassName="stroke-gray-700"
              progressClassName="text-text-brand-subtle"
            >
              <span className="font-pretendard text-text-brand-subtle text-sm font-semibold">
                {Math.round(focusPercentage)}%
              </span>
            </ProgressRing>
          </div>
        </div>
        <div className="h-[1px] w-full bg-gray-700" /> {/* Divider replacement */}
        <div className="flex w-full items-center justify-center gap-4">
          <div className="gap-xs flex w-full flex-col items-center">
            <div className="font-pretendard flex w-full items-center justify-between text-sm font-semibold text-gray-500">
              <span>To do 달성도</span>
            </div>

            <div className="gap-xs px-xs flex w-full flex-col">
              <div className="flex w-full items-center justify-between">
                <span className="font-pretendard text-text-brand-subtle text-[15px] font-bold">
                  {Math.round(todoPercentage)}%
                </span>
                <span className="font-pretendard text-xs font-semibold text-gray-400">
                  {completedTodoCount}/{totalTodoCount}
                </span>
              </div>

              <div className="relative w-full">
                <ProgressBar
                  progress={todoPercentage}
                  className="h-1.5 bg-gray-700"
                  indicatorClassName="bg-green-100"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
