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
  /** 링 크기 (Figma size 변형): 모바일은 sm(104px), 그 외 md(150px). 화면 크기는 상위가 안다 */
  ringSize?: "sm" | "md";
}

export function MyTimer({ sessionId, sessionDurationMinutes, ringSize = "md" }: MyTimerProps) {
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
    <div className="gap-2xl p-lg bg-surface-strong border-border-subtle md:p-xl xl:gap-lg xl:p-2xl flex h-full items-start rounded-md border md:flex-col md:items-end md:justify-between xl:flex-row xl:items-stretch">
      {/* 왼쪽: 정보 영역 (태블릿은 오른쪽 정렬 카드에서 폭을 줄이지 않게 늘린다) */}
      <div className="gap-xs flex flex-1 flex-col md:self-stretch xl:self-auto">
        {/* 제목 + 시간 + 정지/시작 버튼 */}
        <div className="flex flex-col">
          <h2
            className={`text-[15px] leading-[1.4] font-bold md:text-lg ${isRunning ? "text-text-brand-subtler" : "text-text-disabled"}`}
          >
            나의 집중 시간
          </h2>
          <div className="gap-xs flex flex-wrap items-center md:flex-nowrap">
            <span
              className={`text-2xl leading-[1.4] font-bold tabular-nums md:text-[32px] ${isRunning ? "text-text-brand-default" : "text-text-disabled"}`}
            >
              {formatHHMMSS(elapsedSeconds)}
            </span>
            {/* 모바일은 글자 없이 32px 아이콘 버튼 (Button iconOnly small과 같은 값, 이름은 sr-only로 유지) */}
            <Button
              className="pl-xs max-md:p-xs max-md:size-8 max-md:min-w-0"
              variant={isRunning ? "outlined" : "solid"}
              colorScheme="secondary"
              size="small"
              leftIcon={isRunning ? <PauseIcon size="xsmall" /> : <PlayIcon size="xsmall" />}
              onClick={handleToggle}
              disabled={isPending}
            >
              <span className="max-md:sr-only">
                {isRunning ? "잠깐 정지하기" : "다시 시작하기"}
              </span>
            </Button>
          </div>
        </div>

        {/* 상태 + 집중도 */}
        <div className="gap-xs md:gap-md flex flex-wrap items-center md:flex-nowrap">
          <span
            className={`gap-xs flex shrink-0 items-center text-[13px] leading-[1.4] font-semibold whitespace-nowrap md:text-[15px] ${isFocusing ? "text-text-status-positive-default" : "text-text-secondary"}`}
          >
            <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor">
              <circle cx="3" cy="3" r="3" />
            </svg>
            {isFocusing ? "집중 중" : "자리비움"}
          </span>
          <span className="inline-flex gap-2 text-[11px] leading-[1.4] whitespace-nowrap md:text-[13px] md:font-semibold">
            <span className="text-text-disabled">전체 시간 대비</span>
            <span className={isRunning ? "text-text-primary" : "text-text-muted"}>
              {focusRate}% 집중 중
            </span>
          </span>
        </div>
      </div>

      {/* 오른쪽: TimerCircular with Time (가운데 정렬) */}
      <div className="flex shrink-0 items-center justify-center">
        <TimerCircular
          scope="my"
          state={ringState}
          progress={progress}
          preset={ringSize}
          time={formatted}
        />
      </div>
    </div>
  );
}
