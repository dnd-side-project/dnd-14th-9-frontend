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

  const formatted = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return { hours, minutes, seconds, isExpired, formatted };
}
