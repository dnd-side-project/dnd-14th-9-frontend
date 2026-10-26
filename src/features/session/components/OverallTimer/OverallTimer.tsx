"use client";

import { TimerCircular } from "@/components/TimerCircular/TimerCircular";
import { useCountdown } from "@/features/lobby/hooks/useCountdown";
import { formatHHMMSS, formatTimer } from "@/lib/utils/format";

interface OverallTimerProps {
  /** 세션 종료 시간 */
  sessionEndTime: Date;
  /** 전체 세션 시간 (분) */
  sessionDurationMinutes: number;
  /** 집중 중인 인원 */
  focusingCount: number;
  /** 전체 인원 */
  totalCount: number;
}

export function OverallTimer({
  sessionEndTime,
  sessionDurationMinutes,
  focusingCount,
  totalCount,
}: OverallTimerProps) {
  const { hours, minutes, seconds, isExpired } = useCountdown(sessionEndTime);

  // 전체 시간 대비 경과 시간 비율 계산 (0에서 100으로 차오르는 형태, MyTimer와 동일)
  const totalSeconds = sessionDurationMinutes * 60;
  const remainingSeconds = hours * 3600 + minutes * 60 + seconds;
  const elapsedSeconds = Math.max(0, totalSeconds - remainingSeconds);
  const progress = 100 - (remainingSeconds / totalSeconds) * 100;

  // 링 상태: 종료 > 남은 시간 10% 이하(경고) > 진행 중
  const ringState = isExpired ? "completed" : progress >= 90 ? "warning" : "running";

  return (
    <div className="gap-lg p-2xl bg-surface-strong border-border-subtle flex h-full flex-col rounded-md border sm:flex-row">
      {/* 왼쪽: 정보 영역 */}
      <div className="gap-xs flex flex-1 flex-col">
        {/* 제목 + 시간 */}
        <div className="flex flex-col">
          <h2 className="text-text-secondary text-lg leading-[1.4] font-bold">전체 타이머</h2>
          <span className="text-text-primary text-[32px] leading-[1.4] font-bold">
            {isExpired ? "종료" : formatHHMMSS(elapsedSeconds)}
          </span>
        </div>

        {/* 집중 인원 표시 */}
        <span className="text-sm text-gray-400">
          <span className="font-semibold text-green-600">{focusingCount}</span>
          <span>/{totalCount}명 집중 중</span>
        </span>
      </div>

      {/* 오른쪽: TimerCircular with Time (가운데 정렬) */}
      <div className="flex items-center justify-center">
        <TimerCircular
          scope="all"
          state={ringState}
          progress={progress}
          size={150}
          strokeWidth={6}
          time={formatTimer(elapsedSeconds)}
        />
      </div>
    </div>
  );
}
