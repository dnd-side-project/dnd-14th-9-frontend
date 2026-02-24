"use client";

import { useCallback, useRef, useState } from "react";

import { Button } from "@/components/Button/Button";
import { Portal } from "@/components/Portal/Portal";
import { ApiError } from "@/lib/api/api-client";
import { DEFAULT_API_ERROR_MESSAGE } from "@/lib/error/error-codes";
import { navigateWithHardReload } from "@/lib/navigation/hardNavigate";

import { useLeaveSession } from "../hooks/useSessionHooks";
import { clearTimerState } from "../hooks/useSessionTimer";

interface SessionHeaderProps {
  sessionId: string;
  showDialog: boolean;
  onShowDialog: () => void;
  onCloseDialog: () => void;
  isLeavingRef: React.MutableRefObject<boolean>;
}

export function SessionHeader({
  sessionId,
  showDialog,
  onShowDialog,
  onCloseDialog,
  isLeavingRef,
}: SessionHeaderProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const leaveSessionMutation = useLeaveSession();

  const handleLeave = async () => {
    setServerError(null);
    isLeavingRef.current = true;
    try {
      await leaveSessionMutation.mutateAsync({ sessionRoomId: sessionId });
      // 타이머 상태 초기화
      clearTimerState(sessionId);
      onCloseDialog();
      // 하드 네비게이션으로 캐시 클리어 및 SSE 연결 정리
      navigateWithHardReload("/");
    } catch (error) {
      isLeavingRef.current = false;
      const message = error instanceof ApiError ? error.message : DEFAULT_API_ERROR_MESSAGE;
      setServerError(message);
    }
  };

  return (
    <>
      <header className="mb-2xl flex items-start justify-between">
        <div>
          <h1 className="text-[24px] leading-[140%] font-bold text-gray-50">진행 중인 세션</h1>
        </div>

        <Button variant="outlined" colorScheme="secondary" size="small" onClick={onShowDialog}>
          나가기
        </Button>
      </header>

      {showDialog && (
        <LeaveConfirmDialog
          onClose={onCloseDialog}
          onConfirm={handleLeave}
          isPending={leaveSessionMutation.isPending}
          serverError={serverError}
        />
      )}
    </>
  );
}

interface LeaveConfirmDialogProps {
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  serverError: string | null;
}

function LeaveConfirmDialog({
  onClose,
  onConfirm,
  isPending,
  serverError,
}: LeaveConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const setDialogRef = useCallback((node: HTMLDialogElement | null) => {
    if (node && !node.open) {
      node.showModal();
    }
    dialogRef.current = node;
  }, []);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target !== dialogRef.current) return;
    onClose();
  };

  return (
    <Portal>
      <dialog
        ref={setDialogRef}
        onCancel={onClose}
        onClick={handleBackdropClick}
        className="bg-surface-default p-3xl fixed inset-0 m-auto flex w-full max-w-80 flex-col gap-6 rounded-lg border border-gray-900 backdrop:bg-(--color-overlay-default)"
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-text-primary text-lg font-bold">세션에서 나가시겠어요?</h2>
          <p className="text-text-secondary text-sm">
            나가기를 하면 진행 중인 세션에서 나가게 됩니다.
          </p>
        </div>

        {serverError && (
          <div className="rounded-sm bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {serverError}
          </div>
        )}

        <div className="flex w-full gap-2">
          <Button
            variant="ghost"
            colorScheme="secondary"
            size="medium"
            className="flex-1"
            onClick={onClose}
            disabled={isPending}
          >
            취소
          </Button>
          <Button
            variant="solid"
            colorScheme="primary"
            size="medium"
            className="flex-1"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "나가는 중..." : "나가기"}
          </Button>
        </div>
      </dialog>
    </Portal>
  );
}
