"use client";

import dynamic from "next/dynamic";

import { useViewportLayout } from "@/hooks/useViewportLayout";

const MyTimer = dynamic(() => import("./MyTimer/MyTimer").then((mod) => mod.MyTimer), {
  ssr: false,
});

const OverallTimer = dynamic(
  () => import("./OverallTimer/OverallTimer").then((mod) => mod.OverallTimer),
  {
    ssr: false,
  }
);

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
  // 링 크기만 CSS로 못 바꾸므로(Figma size 변형) 모바일일 때 sm을 넘긴다
  const { layout } = useViewportLayout();
  const ringSize = layout === "mobile" ? "sm" : "md";
  const sessionEndTime = new Date(
    new Date(startTime).getTime() + sessionDurationMinutes * 60 * 1000
  );

  return (
    <section
      className={`gap-md md:gap-lg flex flex-col items-stretch md:flex-row ${className ?? ""}`}
    >
      {/* 폭: 태블릿은 Figma 421:247을 비율로, 데스크톱은 6:4 */}
      <div className="md:flex-[421] xl:flex-6">
        <MyTimer
          sessionId={sessionId}
          sessionDurationMinutes={sessionDurationMinutes}
          ringSize={ringSize}
        />
      </div>

      <div className="md:flex-[247] xl:flex-4">
        <OverallTimer
          ringSize={ringSize}
          sessionEndTime={sessionEndTime}
          sessionDurationMinutes={sessionDurationMinutes}
          focusingCount={focusingCount}
          totalCount={totalCount}
        />
      </div>
    </section>
  );
}
