"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/Button/Button";
import { ButtonLink } from "@/components/Button/ButtonLink";
import { Header } from "@/components/Header/Header";
import { AlertIcon } from "@/components/Icon/AlertIcon";
import { CloseIcon } from "@/components/Icon/CloseIcon";
import { ShareIcon } from "@/components/Icon/ShareIcon";
import { useAuthState } from "@/features/auth/hooks/useAuthState";
import { SessionJoinModal } from "@/features/lobby/components/SessionJoinModal";
import { useMe } from "@/features/member/hooks/useMemberHooks";
import { useDialog } from "@/hooks/useDialog";
import { navigateWithHardReload } from "@/lib/navigation/hardNavigate";
import { LOGIN_ROUTE } from "@/lib/routes/route-paths";

import { useSessionDetail, useWaitingRoom } from "../../hooks/useSessionHooks";
import { useShareSession } from "../../hooks/useShareSession";
import { Card } from "../Card/Card";
import { CardSkeleton } from "../Card/CardSkeleton";

import { getSessionStatusDisplay } from "./utils";

interface SessionDialogProps {
  sessionId: string;
}

export function SessionDialog({ sessionId }: SessionDialogProps) {
  const { dialogRef, handleClose, handleBackdropClick } = useDialog("/");
  const { data, error: sessionError } = useSessionDetail(sessionId);
  const { shareSession } = useShareSession();
  const authState = useAuthState();
  const isAuthenticated = authState.status === "authenticated";
  const isRecovering = authState.status === "recovering";
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

  // 자동 리다이렉트: 이미 참여 중이면 세션 페이지로 이동
  // 서버 컴포넌트가 세션 상태에 따라 적절한 페이지(대기실/진행중)로 라우팅
  // Intercepting Route(@modal) 컨텍스트에서 벗어나기 위해 하드 네비게이션 사용
  useEffect(() => {
    if (isParticipant) {
      dialogRef.current?.close();
      navigateWithHardReload(`/session/${sessionId}`);
    }
  }, [isParticipant, sessionId, dialogRef]);

  // 참여 여부 확인 중인지 여부
  const isCheckingParticipation = isAuthenticated && isWaitingRoomLoading;

  const statusDisplay = session ? getSessionStatusDisplay(session.status) : null;

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleClose}
      onClick={handleBackdropClick}
      className="bg-transparent p-0 backdrop:bg-(--color-overlay-default) max-md:m-0 max-md:h-dvh max-md:max-h-[100dvh] max-md:w-screen max-md:max-w-[100vw] max-md:overflow-y-auto max-md:rounded-none max-md:backdrop:bg-transparent md:m-auto md:w-[440px]"
    >
      {/* 모바일: 풀페이지 wrapper (GNB + 내용을 하나의 배경으로 통합) */}
      <div className="bg-surface-default flex flex-col max-md:min-h-full md:rounded-2xl">
        {/* Mobile-only GNB */}
        <div className="md:hidden">
          <Header />
        </div>

        <div className="relative flex flex-col gap-5 px-6 py-5 md:gap-10 md:p-10">
          {/* Tablet+: 공유·닫기 버튼 절대 위치 */}
          <div className="top-lg right-lg hidden items-center gap-1 md:absolute md:flex">
            <button
              type="button"
              onClick={() => shareSession(Number(sessionId))}
              className="text-text-muted hover:text-text-primary focus-visible:ring-text-muted p-xs flex cursor-pointer items-center rounded-sm focus-visible:ring-2"
              aria-label="세션 링크 복사"
            >
              <ShareIcon />
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="text-text-muted hover:text-text-primary focus-visible:ring-text-muted p-xs flex cursor-pointer items-center rounded-sm focus-visible:ring-2"
              aria-label="닫기"
            >
              <CloseIcon />
            </button>
          </div>

          {/* 제목 + Mobile X버튼 인라인 */}
          <div className="flex items-start gap-[10px]">
            <div className="gap-xs flex flex-1 flex-col">
              <h2 className="text-text-primary text-lg leading-[1.4] font-bold md:text-2xl md:leading-[140%]">
                세션 참여하기
              </h2>
              <p className="text-text-secondary font-regular text-[13px] leading-[1.4] md:text-base md:leading-[140%]">
                원하는 세션에서 함께 몰입해 보세요!
              </p>
            </div>
            {/* Mobile-only X버튼 */}
            <button
              type="button"
              onClick={handleClose}
              className="text-text-muted hover:text-text-primary p-2 md:hidden"
              aria-label="닫기"
            >
              <CloseIcon />
            </button>
          </div>

          {/* 카드 영역 */}
          {sessionError ? (
            <div className="flex animate-[fadeIn_0.2s_ease-out] flex-col items-center gap-3 rounded-lg border border-gray-800 py-10">
              <AlertIcon className="text-text-muted h-8 w-8" />
              <p className="text-text-secondary text-sm">세션 정보를 불러오지 못했어요</p>
            </div>
          ) : session ? (
            <Card
              className="max-w-full gap-3 md:gap-4"
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
          ) : (
            <CardSkeleton className="max-w-full" />
          )}

          {/* 버튼 영역 */}
          {sessionError ? (
            <Button
              variant="solid"
              colorScheme="secondary"
              size="medium"
              className="w-full"
              onClick={handleClose}
            >
              닫기
            </Button>
          ) : isRecovering ? (
            <Button variant="solid" colorScheme="primary" size="medium" className="w-full" disabled>
              로그인 상태 확인 중...
            </Button>
          ) : isCheckingParticipation ? (
            <Button variant="solid" colorScheme="primary" size="medium" className="w-full" disabled>
              참여 여부 확인 중...
            </Button>
          ) : isAuthenticated ? (
            <Button
              variant="solid"
              colorScheme="primary"
              size="medium"
              className="w-full"
              onClick={() => setShowJoinModal(true)}
            >
              참여하기
            </Button>
          ) : (
            <ButtonLink
              href={LOGIN_ROUTE}
              variant="solid"
              colorScheme="primary"
              size="medium"
              className="w-full"
            >
              로그인하고 참여하기
            </ButtonLink>
          )}
        </div>
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
