"use client";

import { useMe } from "@/features/member/hooks/useMemberHooks";
import { useSessionDetail, useWaitingRoom } from "@/features/session/hooks/useSessionHooks";

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
  const { data, isLoading, error } = useSessionDetail(sessionId);
  const { data: meData } = useMe();
  // 초기 데이터: REST API로 조회
  const { data: initialWaitingData } = useWaitingRoom(sessionId);
  // 실시간 업데이트: SSE로 수신
  const { data: sseWaitingData } = useWaitingMembersSSE({ sessionId, enabled: true });

  if (isLoading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <p className="text-text-secondary">세션 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !data?.result) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <p className="text-status-danger">세션 정보를 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  const session = data.result;
  const myMemberId = meData?.result?.id;
  // SSE 데이터가 있으면 우선, 없으면 초기 REST API 데이터 사용
  const members: WaitingMember[] = (sseWaitingData?.members ??
    initialWaitingData?.result?.members ??
    []) as WaitingMember[];
  const myTask = members.find((m) => m.memberId === myMemberId)?.task;
  const maxParticipants = session.maxParticipants;

  return (
    <>
      <div className="relative left-1/2 ml-[-50vw] w-screen">
        <CountdownBanner targetTime={new Date(session.startTime)} />
      </div>
      <div className="gap-3xl p-3xl flex flex-col">
        <LobbyHeader />
        <SessionInfoCard session={session} />
        <div className="gap-lg flex">
          <GoalAndTodoCard task={myTask ?? null} />
          <ParticipantListCard members={members} maxParticipants={maxParticipants} />
        </div>
      </div>
    </>
  );
}
