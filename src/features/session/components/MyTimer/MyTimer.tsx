"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/Button/Button";
import { ProgressRing } from "@/components/ProgressRing/ProgressRing";

import { useCountUp } from "../../hooks/useCountUp";

interface MyTimerProps {
  /** 전체 세션 시간 (분) */
  sessionDurationMinutes: number;
  /** 상태 변경 콜백 */
  onStatusChange?: (isFocusing: boolean) => void;
}

export function MyTimer({ sessionDurationMinutes, onStatusChange }: MyTimerProps) {
  const [isFocusing, setIsFocusing] = useState(true);
  const [focusedSeconds, setFocusedSeconds] = useState(0);
  const maxSeconds = sessionDurationMinutes * 60;

  const { formatted, totalSeconds, isRunning, start, pause } = useCountUp({
    autoStart: true,
    maxTime: maxSeconds,
  });

  // 집중 시간 누적 (isRunning이고 집중 중일 때만)
  useEffect(() => {
    if (isRunning && isFocusing) {
      const interval = setInterval(() => {
        setFocusedSeconds((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRunning, isFocusing]);

  // 진행률 계산 (0에서 100으로 채워지는 형태)
  const progress = Math.min((totalSeconds / maxSeconds) * 100, 100);

  // 집중도 계산 (전체 경과 시간 대비 집중 시간)
  const focusRate = totalSeconds > 0 ? Math.round((focusedSeconds / totalSeconds) * 100) : 100;

  const handleToggle = () => {
    if (isRunning) {
      pause();
      setIsFocusing(false);
      onStatusChange?.(false);
    } else {
      start();
      setIsFocusing(true);
      onStatusChange?.(true);
    }
  };

  return (
    <div className="gap-xl p-xl bg-surface-strong flex h-full rounded-2xl">
      {/* 왼쪽: 정보 영역 */}
      <div className="flex flex-1 flex-col gap-3">
        {/* 제목 + 시간 */}
        <div className="flex flex-col gap-1">
          <h2 className="text-[20px] font-bold text-gray-50">내 타이머</h2>
          <span className="text-text-brand-subtle text-[32px] font-bold">{formatted}</span>
        </div>

        {/* 상태 + 집중도 */}
        <div className="gap-md flex items-center">
          <span
            className={`flex items-center gap-1 text-[14px] ${isFocusing ? "text-text-status-positive-default" : "text-text-tertiary"}`}
          >
            <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor">
              <circle cx="3" cy="3" r="3" />
            </svg>
            {isFocusing ? "집중 중" : "자리 비움"}
          </span>
          <div className="flex flex-col">
            <span className="text-text-disabled text-[13px] font-semibold">전체 시간 대비</span>
            <span className="text-text-primary text-[13px] font-semibold">{focusRate}% 집중</span>
          </div>
        </div>

        {/* 정지/시작 버튼 */}
        <Button
          className="mt-auto w-fit"
          variant={isRunning ? "outlined" : "solid"}
          colorScheme={isRunning ? "secondary" : "primary"}
          size="medium"
          onClick={handleToggle}
        >
          {isRunning ? (
            <>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M5.9375 16.668V3.33464C5.9375 2.93193 6.26396 2.60547 6.66667 2.60547C7.06937 2.60547 7.39583 2.93193 7.39583 3.33464V16.668C7.39583 17.0707 7.06937 17.3971 6.66667 17.3971C6.26396 17.3971 5.9375 17.0707 5.9375 16.668ZM12.6042 16.668V3.33464C12.6042 2.93193 12.9306 2.60547 13.3333 2.60547C13.736 2.60547 14.0625 2.93193 14.0625 3.33464V16.668C14.0625 17.0707 13.736 17.3971 13.3333 17.3971C12.9306 17.3971 12.6042 17.0707 12.6042 16.668Z"
                  fill="currentColor"
                />
              </svg>
              <span className="font-semibold">정지하기</span>
            </>
          ) : (
            <span className="font-semibold">다시 시작하기</span>
          )}
        </Button>
      </div>

      {/* 오른쪽: Progress Ring with Time (가운데 정렬) */}
      <div className="flex items-center">
        <ProgressRing
          progress={progress}
          size={200}
          strokeWidth={12}
          trackClassName="stroke-gray-700"
          progressClassName="stroke-green-600"
        >
          <span className="text-text-secondary text-[24px] font-bold">{formatted}</span>
        </ProgressRing>
      </div>
    </div>
  );
}
