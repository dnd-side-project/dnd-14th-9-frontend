"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useMe } from "@/features/member/hooks/useMemberHooks";

import {
  useInProgressData,
  useSessionDetail,
  useSubmitSessionResult,
} from "../hooks/useSessionHooks";
import { useSessionStatusSSE } from "../hooks/useSessionStatusSSE";
import { clearTimerState, getTimerState } from "../hooks/useSessionTimer";

import { SessionDetailSection } from "./SessionDetailSection";
import { SessionGoalAndTodoCard } from "./SessionGoalAndTodoCard";
import { SessionHeader } from "./SessionHeader";
import { SessionParticipantListCard } from "./SessionParticipantListCard";
import { SessionTimerSection } from "./SessionTimerSection";

interface SessionPageContentProps {
  sessionId: string;
}

export function SessionPageContent({ sessionId }: SessionPageContentProps) {
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const isLeavingRef = useRef(false);

  const { data: sessionData, isLoading, error } = useSessionDetail(sessionId);
  const { data: inProgressData } = useInProgressData({ sessionId });
  const { data: meData } = useMe();
  const submitResultMutation = useSubmitSessionResult();

  // 세션 완료 시 결과 제출 및 페이지 이동
  const handleSessionComplete = useCallback(async () => {
    const timerState = getTimerState(sessionId);

    // 타이머 상태가 있으면 결과 전송
    if (timerState) {
      try {
        await submitResultMutation.mutateAsync({
          sessionId,
          body: {
            totalFocusSeconds: timerState.focusedSeconds,
            overallSeconds: timerState.elapsedSeconds,
          },
        });
      } catch {
        // 결과 전송 실패해도 페이지 이동은 진행
        console.error("[SessionPageContent] 결과 전송 실패");
      }
    }

    // 타이머 상태 정리 후 이동
    clearTimerState(sessionId);
    window.location.replace(`/session/${sessionId}/result`);
  }, [sessionId, submitResultMutation]);

  // 브라우저 뒤로 가기 감지
  useEffect(() => {
    const handlePopState = () => {
      if (isLeavingRef.current) return;
      setShowLeaveDialog(true);
      // 뒤로 가기를 취소하기 위해 앞으로 가기
      window.history.go(1);
    };

    window.addEventListener("popstate", handlePopState);

    // 히스토리 엔트리 추가 (뒤로 가기 시 go(1)로 돌아올 수 있도록)
    window.history.pushState({ preventBack: true }, "", window.location.href);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // 세션 상태 SSE - 진행 중 상태가 아니면 적절한 페이지로 이동
  useSessionStatusSSE({
    sessionId,
    enabled: true,
    onStatusChange: (eventData) => {
      if (eventData.status === "COMPLETED") {
        handleSessionComplete();
      } else if (eventData.status === "WAITING") {
        window.location.replace(`/session/${sessionId}/waiting`);
      }
    },
  });

  if (isLoading) {
    console.warn("[SessionPageContent] 로딩 중...");
    return (
      <div className="flex min-h-100 items-center justify-center">
        <p className="text-text-secondary">세션 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !sessionData?.result) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <p className="text-status-danger">세션 정보를 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  const session = sessionData.result;

  const myMemberId = meData?.result?.id;
  const myMember = inProgressData?.members.find((m) => m.memberId === myMemberId);

  console.warn("[SessionPageContent] 정상 렌더링");

  return (
    <div className="p-3xl flex flex-col">
      <SessionHeader
        sessionId={sessionId}
        showDialog={showLeaveDialog}
        onShowDialog={() => setShowLeaveDialog(true)}
        onCloseDialog={() => setShowLeaveDialog(false)}
        isLeavingRef={isLeavingRef}
      />
      <SessionDetailSection
        className="mt-xl"
        thumbnailUrl={session.imageUrl}
        category={session.category}
        title={session.title}
        description={session.summary}
        currentParticipants={inProgressData?.participantCount ?? session.currentParticipants}
        maxParticipants={session.maxParticipants}
        durationMinutes={session.sessionDurationMinutes}
        sessionDate={session.startTime}
        notice={session.notice}
      />
      <SessionTimerSection
        sessionId={sessionId}
        sessionDurationMinutes={session.sessionDurationMinutes}
        startTime={session.startTime}
        focusingCount={inProgressData?.members.filter((m) => m.status === "FOCUS").length ?? 0}
        totalCount={inProgressData?.participantCount ?? session.currentParticipants}
        className="mt-xl"
      />
      <div className="gap-lg mt-xl flex">
        <SessionGoalAndTodoCard
          goal={myMember?.task?.goal ?? ""}
          todos={myMember?.task?.todos ?? []}
          achievementRate={myMember?.achievementRate}
        />
        <SessionParticipantListCard
          members={inProgressData?.members}
          participantCount={inProgressData?.participantCount}
          averageAchievementRate={inProgressData?.averageAchievementRate}
        />
      </div>
    </div>
  );
}
