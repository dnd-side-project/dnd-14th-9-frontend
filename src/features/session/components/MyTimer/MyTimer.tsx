"use client";

import { useState, useEffect } from "react";

import { Badge } from "@/components/Badge/Badge";
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
    <div className="gap-lg flex flex-col items-center">
      {/* Progress Ring with Timer */}
      <ProgressRing
        progress={progress}
        size={200}
        strokeWidth={12}
        trackClassName="stroke-gray-700"
        progressClassName="stroke-green-600"
      >
        <span className="text-[32px] font-bold text-gray-50">{formatted}</span>
      </ProgressRing>

      {/* 제목 */}
      <h2 className="text-[20px] font-bold text-gray-50">내 집중 시간</h2>

      {/* 상태 배지 */}
      <Badge status={isFocusing ? "inProgress" : "recruiting"} radius="max">
        {isFocusing ? "집중 중" : "휴식 중"}
      </Badge>

      {/* 집중도 */}
      <span className="text-[14px] text-gray-400">집중도 {focusRate}%</span>

      {/* 정지/시작 버튼 */}
      <Button
        variant={isRunning ? "outlined" : "solid"}
        colorScheme="primary"
        size="medium"
        onClick={handleToggle}
      >
        {isRunning ? "정지하기" : "시작하기"}
      </Button>
    </div>
  );
}
