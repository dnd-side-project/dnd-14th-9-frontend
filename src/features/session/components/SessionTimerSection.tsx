"use client";

import { useState, useCallback } from "react";

import { MyTimer } from "./MyTimer/MyTimer";
import { TotalTimer } from "./TotalTimer/TotalTimer";

interface SessionTimerSectionProps {
  sessionId: string;
  className?: string;
}

// TODO: 실제 API 연동 시 제거
const MOCK_SESSION = {
  durationMinutes: 120, // 2시간
  totalParticipants: 6,
};

export function SessionTimerSection({ sessionId, className }: SessionTimerSectionProps) {
  // 세션 종료 시간 (컴포넌트 마운트 시점 + 세션 시간)
  // useState의 lazy initializer는 초기 마운트 시에만 실행됨
  const [sessionEndTime] = useState(
    () => new Date(Date.now() + MOCK_SESSION.durationMinutes * 60 * 1000)
  );

  const [focusingCount, setFocusingCount] = useState(MOCK_SESSION.totalParticipants);

  const handleMyStatusChange = useCallback((isFocusing: boolean) => {
    // 실제로는 서버에 상태 전송 및 SSE로 전체 집중 인원 업데이트
    setFocusingCount((prev) => (isFocusing ? prev + 1 : prev - 1));
  }, []);

  return (
    <section className={`gap-lg flex items-stretch ${className ?? ""}`}>
      {/* 내 타이머 (왼쪽, 60%) */}
      <div className="flex-6">
        <MyTimer
          sessionDurationMinutes={MOCK_SESSION.durationMinutes}
          onStatusChange={handleMyStatusChange}
        />
      </div>

      {/* 전체 타이머 (오른쪽, 40%) */}
      <div className="flex-4">
        <TotalTimer
          sessionEndTime={sessionEndTime}
          sessionDurationMinutes={MOCK_SESSION.durationMinutes}
          focusingCount={focusingCount}
          totalCount={MOCK_SESSION.totalParticipants}
        />
      </div>
    </section>
  );
}
