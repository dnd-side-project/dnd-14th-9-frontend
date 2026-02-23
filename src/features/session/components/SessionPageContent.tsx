"use client";

import { useRouter } from "next/navigation";

import { useMe } from "@/features/member/hooks/useMemberHooks";

import { useInProgressData, useSessionDetail } from "../hooks/useSessionHooks";
import { useSessionStatusSSE } from "../hooks/useSessionStatusSSE";

import { SessionDetailSection } from "./SessionDetailSection";
import { SessionGoalAndTodoCard } from "./SessionGoalAndTodoCard";
import { SessionHeader } from "./SessionHeader";
import { SessionParticipantListCard } from "./SessionParticipantListCard";
import { SessionTimerSection } from "./SessionTimerSection";

interface SessionPageContentProps {
  sessionId: string;
}

export function SessionPageContent({ sessionId }: SessionPageContentProps) {
  const router = useRouter();
  const { data: sessionData, isLoading, error } = useSessionDetail(sessionId);
  const { data: inProgressData } = useInProgressData({ sessionId });
  const { data: meData } = useMe();

  // 세션 상태 SSE - 진행 중 상태가 아니면 적절한 페이지로 이동
  useSessionStatusSSE({
    sessionId,
    enabled: true,
    onStatusChange: (eventData) => {
      if (eventData.status === "COMPLETED") {
        router.replace(`/session/${sessionId}/result`);
      } else if (eventData.status === "WAITING") {
        router.replace(`/session/${sessionId}/waiting`);
      }
    },
  });

  if (isLoading) {
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

  return (
    <div className="p-3xl flex flex-col">
      <SessionHeader sessionId={sessionId} />
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
