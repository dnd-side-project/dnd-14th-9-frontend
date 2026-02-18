"use client";

import { useState, useEffect, useCallback } from "react";

interface CountdownResult {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  formatted: string;
}

export function useCountdown(targetTime: Date): CountdownResult {
  const calculateRemaining = useCallback(() => {
    return Math.max(0, Math.floor((targetTime.getTime() - Date.now()) / 1000));
  }, [targetTime]);

  const [totalSeconds, setTotalSeconds] = useState(calculateRemaining);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setTotalSeconds(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateRemaining]);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const isExpired = totalSeconds <= 0;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}시간`);
  if (minutes > 0 || hours > 0) parts.push(`${String(minutes).padStart(2, "0")}분`);
  parts.push(`${String(seconds).padStart(2, "0")}초`);
  const formatted = parts.join(" ");

  return { hours, minutes, seconds, isExpired, formatted };
}
