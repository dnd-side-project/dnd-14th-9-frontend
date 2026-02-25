"use client";

import { useCallback, useRef, useState } from "react";

import { Button } from "@/components/Button/Button";
import { AlertIcon } from "@/components/Icon/AlertIcon";
import { ChevronLeftIcon } from "@/components/Icon/ChevronLeftIcon";
import { Portal } from "@/components/Portal/Portal";
import { useLeaveSession } from "@/features/session/hooks/useSessionHooks";
import { ApiError } from "@/lib/api/api-client";
import { DEFAULT_API_ERROR_MESSAGE } from "@/lib/error/error-codes";
import { navigateWithHardReload } from "@/lib/navigation/hardNavigate";
import { toast } from "@/lib/toast";

interface LobbyHeaderProps {
  sessionId: string;
  showDialog: boolean;
  onShowDialog: () => void;
  onCloseDialog: () => void;
  isLeavingRef: React.MutableRefObject<boolean>;
}

export function LobbyHeader({
  sessionId,
  showDialog,
  onShowDialog,
  onCloseDialog,
  isLeavingRef,
}: LobbyHeaderProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const leaveSessionMutation = useLeaveSession();
  const leaveButtonRef = useRef<HTMLButtonElement>(null);

  const handleLeave = async () => {
    setServerError(null);
    isLeavingRef.current = true;
    try {
    } catch (error: unknown) {
      isLeavingRef.current = false;
      const message = error instanceof ApiError ? error.message : DEFAULT_API_ERROR_MESSAGE;
      setServerError(message);
      toast.error(message);
    }
  };

  return (
    <>
      <header className="mb-2xl flex items-start justify-between">
        <div className="gap-lg flex items-start">
          <button
            type="button"
            onClick={onShowDialog}
            aria-label="뒤로 가기"
            className="text-text-muted hover:text-text-secondary mt-1 shrink-0 cursor-pointer transition-colors"
          >
            <ChevronLeftIcon size="medium" />
          </button>

          <div>
            <h1 className="text-[24px] leading-[140%] font-bold text-gray-50">세션 시작 대기 방</h1>
            <p className="mt-2xs text-base text-gray-500">
              세션 시작 전 대기 방이에요. 세션은 시간이 되면 자동 시작되요
            </p>
          </div>
        </div>

        <Button
          ref={leaveButtonRef}
          variant="outlined"
          colorScheme="secondary"
          size="small"
          onClick={onShowDialog}
        >
          나가기
        </Button>
      </header>

      {showDialog && (
        <LeaveConfirmDialog
          onClose={() => {
            onCloseDialog();
            leaveButtonRef.current?.focus();
          }}
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
          <p className="text-text-secondary text-sm">나가기를 하면 대기 방에서 나가게 됩니다.</p>
        </div>

        {serverError && (
          <div className="flex animate-[fadeIn_0.2s_ease-out] items-center gap-2 rounded-sm bg-red-500/10 px-4 py-3 text-sm text-red-500">
            <AlertIcon className="h-4 w-4 shrink-0" />
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
