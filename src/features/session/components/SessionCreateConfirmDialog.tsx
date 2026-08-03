"use client";

import { useRef } from "react";

import { Button } from "@/components/Button/Button";
import { Portal } from "@/components/Portal/Portal";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

interface SessionCreateConfirmDialogProps {
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

export function SessionCreateConfirmDialog({
  onClose,
  onConfirm,
  isPending,
}: SessionCreateConfirmDialogProps) {
  useBodyScrollLock();

  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const setDialogRef = (node: HTMLDialogElement | null) => {
    if (node && !node.open) {
      node.showModal();
    }
    dialogRef.current = node;
  };

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target !== dialogRef.current) return;
    if (isPending) return;
    onClose();
  };

  return (
    <Portal>
      <dialog
        ref={setDialogRef}
        onCancel={(event) => {
          event.preventDefault();
          if (!isPending) onClose();
        }}
        onClick={handleBackdropClick}
        className="bg-surface-default p-3xl max-md:p-xl fixed inset-0 m-auto flex w-full max-w-100 flex-col gap-6 rounded-lg border border-gray-900 backdrop:bg-(--color-overlay-default) max-md:w-[calc(100%-2rem)]"
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-text-primary text-lg font-bold">이대로 세션을 만들까요?</h2>
          <p className="text-text-secondary text-sm">
            참여자 입장 후에는 세션 설정을 변경할 수 없어요.
            <br />
            현재 설정으로 세션을 생성할까요?
          </p>
        </div>

        <div className="flex w-full gap-2">
          <Button
            variant="solid"
            colorScheme="tertiary"
            size="medium"
            className="flex-1"
            onClick={onClose}
            disabled={isPending}
          >
            돌아가기
          </Button>
          <Button
            variant="solid"
            colorScheme="primary"
            size="medium"
            className="flex-1"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "생성 중..." : "세션 만들기"}
          </Button>
        </div>
      </dialog>
    </Portal>
  );
}
