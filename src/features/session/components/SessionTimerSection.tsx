"use client";

import { useMemo } from "react";

import dynamic from "next/dynamic";

import { MyTimer } from "./MyTimer/MyTimer";

const TotalTimer = dynamic(() => import("./TotalTimer/TotalTimer").then((mod) => mod.TotalTimer), {
  ssr: false,
});

interface SessionTimerSectionProps {
  sessionId: string;
  sessionDurationMinutes: number;
  startTime: string;
  focusingCount: number;
  totalCount: number;
  className?: string;
}

export function SessionTimerSection({
  sessionId,
  sessionDurationMinutes,
  startTime,
  focusingCount,
  totalCount,
  className,
}: SessionTimerSectionProps) {
  const sessionEndTime = useMemo(
    () => new Date(new Date(startTime).getTime() + sessionDurationMinutes * 60 * 1000),
    [startTime, sessionDurationMinutes]
  );

  return (
    <section className={`gap-lg flex items-stretch ${className ?? ""}`}>
      <div className="flex-6">
        <MyTimer sessionId={sessionId} sessionDurationMinutes={sessionDurationMinutes} />
      </div>

      <div className="flex-4">
        <TotalTimer
          sessionEndTime={sessionEndTime}
          sessionDurationMinutes={sessionDurationMinutes}
          focusingCount={focusingCount}
          totalCount={totalCount}
        />
      </div>
    </section>
  );
}
