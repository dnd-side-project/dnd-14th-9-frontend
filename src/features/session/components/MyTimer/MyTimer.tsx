"use client";

import { Button } from "@/components/Button/Button";
import { PauseIcon } from "@/components/Icon/PauseIcon";
import { PlayIcon } from "@/components/Icon/PlayIcon";
import { TimerCircular } from "@/components/TimerCircular/TimerCircular";
import { ApiError } from "@/lib/api/api-client";
import { DEFAULT_API_ERROR_MESSAGE } from "@/lib/error/error-codes";
import { toast } from "@/lib/toast";
import { formatHHMMSS } from "@/lib/utils/format";

import { useToggleMyStatus } from "../../hooks/useSessionHooks";
import { useSessionTimer } from "../../hooks/useSessionTimer";

interface MyTimerProps {
  sessionId: string;
  sessionDurationMinutes: number;
}

export function MyTimer({ sessionId, sessionDurationMinutes }: MyTimerProps) {
  const maxSeconds = sessionDurationMinutes * 60;

  const { elapsedSeconds, formatted, isFocusing, isRunning, focusRate, progress, start, pause } =
    useSessionTimer({
      sessionId,
      maxSeconds,
      autoStart: true,
    });

  // 링 상태: 종료 > 진행 중 > 시작 전(0%에서 정지) > 정지
  const ringState =
    progress >= 100 ? "completed" : isRunning ? "running" : progress === 0 ? "default" : "paused";

  const { mutate: toggleStatus, isPending } = useToggleMyStatus();

  const handleToggle = () => {
    // 이중 호출 방지
    if (isPending) return;

    // Optimistic update: 즉시 UI 반영
    const wasRunning = isRunning;
    if (wasRunning) {
      pause();
    } else {
      start();
    }

    toggleStatus(
      { sessionId },
      {
        onSuccess: (response) => {
          // 서버 상태로 동기화 (idempotent)
          const newStatus = response.result.currentStatus;
          if (newStatus === "FOCUSED") {
            start();
          } else {
            pause();
          }
        },
        onError: (error) => {
          console.error("[MyTimer] 상태 전환 실패:", error);
          const message = error instanceof ApiError ? error.message : DEFAULT_API_ERROR_MESSAGE;
          toast.error(message);
          // 롤백: 이전 상태로 복원
          if (wasRunning) {
            start();
          } else {
            pause();
          }
        },
      }
    );
  };

  return (
    <div className="gap-lg p-2xl bg-surface-strong border-border-subtle flex h-full flex-col rounded-md border sm:flex-row">
      {/* 왼쪽: 정보 영역 */}
      <div className="gap-xs flex flex-1 flex-col">
        {/* 제목 + 시간 + 정지/시작 버튼 */}
        <div className="flex flex-col">
          <h2
            className={`text-lg leading-[1.4] font-bold ${isRunning ? "text-text-brand-subtler" : "text-text-disabled"}`}
          >
            나의 집중 시간
          </h2>
          <div className="gap-xs flex items-center">
            <span
              className={`text-[32px] leading-[1.4] font-bold tabular-nums ${isRunning ? "text-text-brand-default" : "text-text-disabled"}`}
            >
              {formatHHMMSS(elapsedSeconds)}
            </span>
            <Button
              className="pl-xs"
              variant={isRunning ? "outlined" : "solid"}
              colorScheme="secondary"
              size="small"
              leftIcon={isRunning ? <PauseIcon size="xsmall" /> : <PlayIcon size="xsmall" />}
              onClick={handleToggle}
              disabled={isPending}
            >
              {isRunning ? "잠깐 정지하기" : "다시 시작하기"}
            </Button>
          </div>
        </div>

        {/* 상태 + 집중도 */}
        <div className="gap-md flex items-center">
          <span
            className={`gap-xs flex shrink-0 items-center text-[15px] leading-[1.4] font-semibold whitespace-nowrap ${isFocusing ? "text-text-status-positive-default" : "text-text-secondary"}`}
          >
            <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor">
              <circle cx="3" cy="3" r="3" />
            </svg>
            {isFocusing ? "집중 중" : "자리비움"}
          </span>
          <span className="inline-flex gap-2 text-[13px] leading-[1.4] font-semibold whitespace-nowrap">
            <span className="text-text-disabled">전체 시간 대비</span>
            <span className={isRunning ? "text-text-primary" : "text-text-muted"}>
              {focusRate}% 집중 중
            </span>
          </span>
        </div>
      </div>

      {/* 오른쪽: TimerCircular with Time (가운데 정렬) */}
      <div className="flex items-center justify-center">
        <TimerCircular
          scope="my"
          state={ringState}
          progress={progress}
          size={150}
          strokeWidth={6}
          time={formatted}
        />
      </div>
    </div>
  );
}
