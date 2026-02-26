"use client";

import { ErrorFallbackUI } from "@/components/Error/ErrorFallbackUI";
import { useMe } from "@/features/member/hooks/useMemberHooks";
import { useSessionDetail, useWaitingRoom } from "@/features/session/hooks/useSessionHooks";
import { useSessionStatusSSE } from "@/features/session/hooks/useSessionStatusSSE";
import { usePreventBackNavigation } from "@/hooks/usePreventBackNavigation";

import { useWaitingMembersSSE } from "../hooks/useWaitingMembersSSE";

import { CountdownBanner } from "./CountdownBanner";
import { GoalAndTodoCard } from "./GoalAndTodoCard";
import { LobbyHeader } from "./LobbyHeader";
import { ParticipantListCard } from "./ParticipantListCard";
import { SessionInfoCard } from "./SessionInfoCard";

import type { WaitingMember } from "../types";

interface WaitingRoomContentProps {
  sessionId: string;
}

export function WaitingRoomContent({ sessionId }: WaitingRoomContentProps) {
  const { showLeaveDialog, setShowLeaveDialog, isLeavingRef } = usePreventBackNavigation();

  const { data, isLoading, error, refetch } = useSessionDetail(sessionId);
  const { data: meData } = useMe();
  // 초기 데이터: REST API로 조회
  const { data: initialWaitingData } = useWaitingRoom(sessionId);
  // 실시간 업데이트: SSE로 수신
  const { data: sseWaitingData } = useWaitingMembersSSE({ sessionId, enabled: true });

  // 세션 상태 SSE - 대기 상태가 아니면 적절한 페이지로 이동
  // hard navigation을 사용하여 modal interceptor routing 우회
  useSessionStatusSSE({
    sessionId,
    enabled: true,
    onStatusChange: (eventData) => {
      if (eventData.status === "IN_PROGRESS") {
        window.location.replace(`/session/${sessionId}`);
      } else if (eventData.status === "COMPLETED") {
        window.location.replace(`/session/${sessionId}/result`);
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

  if (error || !data?.result) {
    return (
      <div className="flex h-[calc(100vh-200px)] min-h-[400px] items-center justify-center">
        <ErrorFallbackUI
          title="세션 정보를 불러올 수 없어요"
          description="데이터를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요."
          buttonLabel="다시 시도하기"
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  const session = data.result;

  const myMemberId = meData?.result?.id;
  // 참여자 목록: SSE 데이터가 있으면 우선, 없으면 초기 REST API 데이터 사용
  const members: WaitingMember[] = (sseWaitingData?.members ??
    initialWaitingData?.result?.members ??
    []) as WaitingMember[];
  // 내 할 일: REST API 데이터에서 가져옴 (SSE는 참여자 상태만 업데이트)
  const myTask =
    initialWaitingData?.result?.members?.find((m) => m.memberId === myMemberId)?.task ?? null;
  const maxParticipants = session.maxParticipants;

  return (
    <>
      <div className="relative left-1/2 ml-[-50vw] w-screen">
        <CountdownBanner targetTime={new Date(session.startTime)} />
      </div>
      <div className="gap-3xl p-3xl flex flex-col">
        <LobbyHeader
          sessionId={sessionId}
          showDialog={showLeaveDialog}
          onShowDialog={() => setShowLeaveDialog(true)}
          onCloseDialog={() => setShowLeaveDialog(false)}
          isLeavingRef={isLeavingRef}
        />
        <SessionInfoCard session={session} />
        <div className="gap-lg flex">
          <GoalAndTodoCard sessionId={sessionId} task={myTask} />
          <ParticipantListCard
            sessionId={sessionId}
            members={members}
            maxParticipants={maxParticipants}
          />
        </div>
      </div>
    </>
  );
}
