"use client";

import { ProgressRing } from "@/components/ProgressRing/ProgressRing";
import { useCountdown } from "@/features/lobby/hooks/useCountdown";

interface TotalTimerProps {
  /** 세션 종료 시간 */
  sessionEndTime: Date;
  /** 전체 세션 시간 (분) */
  sessionDurationMinutes: number;
  /** 집중 중인 인원 */
  focusingCount: number;
  /** 전체 인원 */
  totalCount: number;
}

export function TotalTimer({
  sessionEndTime,
  sessionDurationMinutes,
  focusingCount,
  totalCount,
}: TotalTimerProps) {
  const { hours, minutes, seconds, formatted, isExpired } = useCountdown(sessionEndTime);

  // 전체 시간 대비 남은 시간 비율 계산 (100에서 0으로 줄어드는 형태)
  const totalSeconds = sessionDurationMinutes * 60;
  const remainingSeconds = hours * 3600 + minutes * 60 + seconds;
  const progress = (remainingSeconds / totalSeconds) * 100;

  return (
    <div className="gap-lg flex flex-col items-center">
      {/* Progress Ring - 시간이 줄어들면서 비는 형태 */}
      <ProgressRing
        progress={progress}
        size={160}
        strokeWidth={10}
        trackClassName="stroke-gray-700"
        progressClassName="stroke-green-600"
      >
        <span className="text-[24px] font-bold text-gray-50">{isExpired ? "종료" : formatted}</span>
      </ProgressRing>

      {/* 제목 */}
      <h2 className="text-[20px] font-bold text-gray-50">전체 세션 시간</h2>

      {/* 집중 인원 표시 */}
      <div className="flex items-center gap-2 text-[14px] text-gray-400">
        <span>집중 중</span>
        <span className="font-semibold text-green-600">{focusingCount}</span>
        <span>/</span>
        <span>{totalCount}명</span>
      </div>
    </div>
  );
}
