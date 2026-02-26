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
    <div className="gap-xl p-xl bg-surface-strong flex h-full rounded-2xl">
      {/* 왼쪽: 정보 영역 */}
      <div className="flex flex-1 flex-col gap-3">
        {/* 제목 + 시간 */}
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-gray-50">전체 타이머</h2>
          <span className="text-[32px] font-bold text-gray-50">
            {isExpired ? "종료" : formatted}
          </span>
        </div>

        {/* 집중 인원 표시 */}
        <span className="text-sm text-gray-400">
          <span className="font-semibold text-green-600">{focusingCount}</span>
          <span>/{totalCount}명 집중 중</span>
        </span>
      </div>

      {/* 오른쪽: Progress Ring with Time (가운데 정렬) */}
      <div className="flex items-center">
        <ProgressRing
          progress={progress}
          size={200}
          strokeWidth={12}
          trackClassName="stroke-border-inverse"
          progressClassName="stroke-border-error-default"
        >
          <span className="text-text-disabled text-2xl font-bold">
            {isExpired ? "종료" : formatted}
          </span>
        </ProgressRing>
      </div>
    </div>
  );
}
