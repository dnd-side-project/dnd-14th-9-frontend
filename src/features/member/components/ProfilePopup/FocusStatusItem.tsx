"use client";

import { ProgressBar } from "@/components/ProgressBar/ProgressBar";
import { ProgressRing } from "@/components/ProgressRing/ProgressRing";

interface FocusStatusItemProps {
  focusTimeMinutes: number;
  totalTimeMinutes: number;
  todoCompleted: number;
  todoTotal: number;
}

export function FocusStatusItem({
  focusTimeMinutes,
  totalTimeMinutes,
  todoCompleted,
  todoTotal,
}: FocusStatusItemProps) {
  const focusPercentage = totalTimeMinutes > 0 ? (focusTimeMinutes / totalTimeMinutes) * 100 : 0;
  const todoPercentage = todoTotal > 0 ? (todoCompleted / todoTotal) * 100 : 0;

  return (
    <div className="flex h-[200px] w-full flex-col gap-6 rounded-md bg-gray-800 px-4 py-6">
      <div className="flex w-full flex-col gap-3">
        <div className="flex w-full items-center gap-[9px]">
          <div className="flex h-[56px] w-[241px] flex-col items-start gap-1">
            <p className="font-pretendard text-sm font-semibold text-gray-500">집중도</p>
            <p className="font-pretendard text-lg leading-[1.4] text-green-100">
              <span className="font-bold">총 {focusTimeMinutes}분 </span>
              <span className="text-sm font-semibold text-gray-400">/ {totalTimeMinutes}분</span>
            </p>
          </div>
          <div className="flex h-[56px] w-[56px] shrink-0 items-center justify-center px-[13px] py-4">
            <ProgressRing
              progress={focusPercentage}
              size={56}
              strokeWidth={5.6}
              trackClassName="stroke-gray-700"
              progressClassName="stroke-green-100"
            >
              <span className="font-pretendard text-sm font-semibold text-green-100">
                {Math.round(focusPercentage)}%
              </span>
            </ProgressRing>
          </div>
        </div>
        <div className="h-[1px] w-full bg-gray-700" /> {/* Divider replacement */}
        <div className="flex w-full items-center justify-center gap-4">
          <div className="flex w-full flex-col items-center gap-2">
            <div className="font-pretendard flex w-full items-center justify-between text-sm font-semibold text-gray-500">
              <span>To do 달성도</span>
            </div>

            <div className="relative w-full">
              <ProgressBar
                progress={todoPercentage}
                className="h-1.5 bg-gray-700"
                indicatorClassName="bg-green-100"
              />
            </div>

            <div className="mt-1 flex w-full items-center justify-between">
              <span className="font-pretendard text-[15px] font-bold text-green-100">
                {Math.round(todoPercentage)}%
              </span>
              <span className="font-pretendard text-xs font-semibold text-gray-400">
                {todoCompleted}/{todoTotal}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
