"use client";

import { useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { useMe } from "@/features/member/hooks/useMemberHooks";
import { useSessionDetail, useWaitingRoom } from "@/features/session/hooks/useSessionHooks";
import { useSessionStatusSSE } from "@/features/session/hooks/useSessionStatusSSE";

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
  const router = useRouter();
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const isLeavingRef = useRef(false);

  const { data, isLoading, error } = useSessionDetail(sessionId);
  const { data: meData } = useMe();
  // 초기 데이터: REST API로 조회
  const { data: initialWaitingData } = useWaitingRoom(sessionId);
  // 실시간 업데이트: SSE로 수신
  const { data: sseWaitingData } = useWaitingMembersSSE({ sessionId, enabled: true });

  // 브라우저 뒤로 가기 감지
  useEffect(() => {
    const handlePopState = () => {
      if (isLeavingRef.current) return;
      setShowLeaveDialog(true);
      // 뒤로 가기를 취소하기 위해 앞으로 가기
      window.history.go(1);
    };

    // 페이지 이탈 시 브라우저 기본 확인 다이얼로그 표시 (다른 도메인으로 이동 시)
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isLeavingRef.current) return;
      event.preventDefault();
      return "";
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // 히스토리 엔트리 추가 (뒤로 가기 시 go(1)로 돌아올 수 있도록)
    window.history.pushState({ preventBack: true }, "", window.location.href);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // 세션 상태 SSE - 대기 상태가 아니면 적절한 페이지로 이동
  useSessionStatusSSE({
    sessionId,
    enabled: true,
    onStatusChange: (eventData) => {
      if (eventData.status === "IN_PROGRESS") {
        router.replace(`/session/${sessionId}`);
      } else if (eventData.status === "COMPLETED") {
        router.replace(`/session/${sessionId}/result`);
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
        <LobbyHeader
          sessionId={sessionId}
          showDialog={showLeaveDialog}
          onShowDialog={() => setShowLeaveDialog(true)}
          onCloseDialog={() => setShowLeaveDialog(false)}
          isLeavingRef={isLeavingRef}
        />
        <SessionInfoCard session={session} />
        <div className="gap-lg flex">
          <GoalAndTodoCard sessionId={sessionId} task={myTask ?? null} />
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
