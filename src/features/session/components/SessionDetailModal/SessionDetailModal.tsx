"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/Button/Button";
import { ButtonLink } from "@/components/Button/ButtonLink";
import { CloseIcon } from "@/components/Icon/CloseIcon";
import { SessionJoinModal } from "@/features/lobby/components/SessionJoinModal";
import { useIsAuthenticated, useMe } from "@/features/member/hooks/useMemberHooks";
import { useDialog } from "@/hooks/useDialog";

import { useSessionDetail, useWaitingRoom } from "../../hooks/useSessionHooks";
import { Card } from "../Card/Card";

import { getSessionStatusDisplay } from "./utils";

interface SessionDetailModalProps {
  sessionId: string;
}

export function SessionDetailModal({ sessionId }: SessionDetailModalProps) {
  const router = useRouter();
  const { dialogRef, handleClose, handleBackdropClick } = useDialog("/");
  const { data } = useSessionDetail(sessionId);
  const isAuthenticated = useIsAuthenticated();
  const [showJoinModal, setShowJoinModal] = useState(false);

  // 현재 사용자 정보 (인증된 경우만)
  const { data: meData } = useMe({ enabled: isAuthenticated });

  // 대기방 참여자 정보 (인증된 경우만)
  const { data: waitingRoomData, isLoading: isWaitingRoomLoading } = useWaitingRoom(sessionId, {
    enabled: isAuthenticated,
  });

  const session = data?.result;
  const myMemberId = meData?.result?.id;

  // 참여 여부 확인
  const isParticipant =
    waitingRoomData?.result?.members?.some((member) => member.memberId === myMemberId) ?? false;

  // 세션이 대기 상태인지 확인
  const isWaitingStatus = session?.status === "대기";

  // 자동 리다이렉트: 이미 참여 중이고 세션이 대기 상태이면 대기방으로 이동
  useEffect(() => {
    if (isParticipant && isWaitingStatus) {
      dialogRef.current?.close();
      router.replace(`/session/${sessionId}/waiting`);
    }
  }, [isParticipant, isWaitingStatus, sessionId, router, dialogRef]);

  // 참여 여부 확인 중인지 여부
  const isCheckingParticipation = isAuthenticated && isWaitingRoomLoading;

  const statusDisplay = session ? getSessionStatusDisplay(session.status) : null;

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleClose}
      onClick={handleBackdropClick}
      className="fixed inset-0 m-auto w-full max-w-[360px] rounded-lg bg-transparent p-0 backdrop:bg-(--color-overlay-default) md:max-w-[400px] lg:max-w-[440px]"
    >
      <div className="gap-2xl p-3xl bg-surface-default relative flex flex-col rounded-2xl">
        {/* 닫기 버튼 */}
        <button
          type="button"
          onClick={handleClose}
          className="text-text-muted hover:text-text-primary focus-visible:ring-text-muted p-xs top-lg right-lg gap-none absolute flex cursor-pointer items-center rounded-sm focus-visible:ring-2"
          aria-label="닫기"
        >
          <CloseIcon />
        </button>

        {/* 제목 영역 */}
        <div className="gap-xs flex flex-col">
          <h2 className="text-text-primary font-pretendard text-2xl leading-[140%] font-bold">
            세션 참여하기
          </h2>
          <p className="text-text-secondary font-pretendard text-base leading-[140%] font-normal">
            원하는 세션에서 몰입의 경험을 함께보세요!
          </p>
        </div>

        {/* 카드 영역 */}
        {session && (
          <Card
            className="max-w-full"
            thumbnailSrc={session.imageUrl}
            category={session.category}
            statusText={statusDisplay?.text}
            statusBadgeStatus={statusDisplay?.badgeStatus}
            title={session.title}
            description={session.summary}
            currentParticipants={session.currentParticipants}
            maxParticipants={session.maxParticipants}
            durationMinutes={session.sessionDurationMinutes}
            sessionDate={session.startTime}
          />
        )}

        {/* 버튼 영역 */}
        {isAuthenticated ? (
          <Button
            variant="solid"
            colorScheme="primary"
            size="medium"
            className="w-full"
            onClick={() => setShowJoinModal(true)}
            disabled={isCheckingParticipation}
          >
            {isCheckingParticipation ? "확인 중..." : "참여하기"}
          </Button>
        ) : (
          <ButtonLink
            href="/login"
            variant="solid"
            colorScheme="primary"
            size="medium"
            className="w-full"
          >
            로그인하기
          </ButtonLink>
        )}
      </div>

      {showJoinModal && (
        <SessionJoinModal
          sessionId={sessionId}
          onClose={() => setShowJoinModal(false)}
          onJoinSuccess={() => {
            // router.back() 없이 dialog만 직접 닫기
            dialogRef.current?.close();
          }}
        />
      )}
    </dialog>
  );
}
