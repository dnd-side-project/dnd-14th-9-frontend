"use client";

import { useCallback, useRef } from "react";

import { Button } from "@/components/Button/Button";
import { AlertIcon } from "@/components/Icon/AlertIcon";
import { Portal } from "@/components/Portal/Portal";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

interface LeaveConfirmDialogProps {
  description: string;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  serverError: string | null;
}

export function LeaveConfirmDialog({
  description,
  onClose,
  onConfirm,
  isPending,
  serverError,
}: LeaveConfirmDialogProps) {
  useBodyScrollLock();

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
          <p className="text-text-secondary text-sm">{description}</p>
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
