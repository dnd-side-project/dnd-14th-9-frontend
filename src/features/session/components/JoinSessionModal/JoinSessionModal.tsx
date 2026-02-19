"use client";

import { useEffect, useRef } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/Button/Button";
import { CloseIcon } from "@/components/Icon/CloseIcon";

import { useSessionDetail } from "../../hooks/useSessionHooks";
import { Card } from "../Card/Card";

import { getSessionStatusDisplay } from "./utils";

interface JoinSessionModalProps {
  sessionId: string;
}

export function JoinSessionModal({ sessionId }: JoinSessionModalProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { data } = useSessionDetail(sessionId);

  const session = data?.result;

  const handleClose = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.replace("/");
  };

  const handleLogin = () => {
    router.push(`/login?next=/session/${sessionId}/waiting`);
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.showModal();
    return () => dialog.close();
  }, []);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target !== dialogRef.current) return;
    handleClose();
  };

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
        <Button
          variant="solid"
          colorScheme="primary"
          size="medium"
          className="w-full"
          onClick={handleLogin}
        >
          로그인하기
        </Button>
      </div>
    </dialog>
  );
}
