"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface CountUpResult {
  totalSeconds: number;
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
}

interface UseCountUpOptions {
  /** 시작 시간 (초) */
  startTime?: number;
  /** 최대 시간 (초, 선택) */
  maxTime?: number;
  /** 자동 시작 여부 */
  autoStart?: boolean;
}

export function useCountUp(options: UseCountUpOptions = {}): CountUpResult {
  const { startTime = 0, maxTime, autoStart = true } = options;

  const [totalSeconds, setTotalSeconds] = useState(startTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setTotalSeconds(startTime);
    setIsRunning(false);
  }, [startTime]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTotalSeconds((prev) => {
          if (maxTime && prev >= maxTime) {
            setIsRunning(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, maxTime]);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // MM:SS 포맷 (1시간 미만일 경우)
  const formatted =
    hours > 0
      ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return {
    totalSeconds,
    hours,
    minutes,
    seconds,
    formatted,
    isRunning,
    start,
    pause,
    reset,
  };
}
