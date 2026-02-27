"use client";

import { useCallback, useRef } from "react";

import { Button } from "@/components/Button/Button";
import { Portal } from "@/components/Portal/Portal";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

interface KickedDialogProps {
  onConfirm: () => void;
}

export function KickedDialog({ onConfirm }: KickedDialogProps) {
  useBodyScrollLock();

  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const setDialogRef = useCallback((node: HTMLDialogElement | null) => {
    if (node && !node.open) {
      node.showModal();
    }
    dialogRef.current = node;
  }, []);

  return (
    <Portal>
      <dialog
        ref={setDialogRef}
        onCancel={(e) => e.preventDefault()}
        className="bg-surface-default p-3xl fixed inset-0 m-auto flex w-full max-w-80 flex-col gap-6 rounded-lg border border-gray-900 backdrop:bg-(--color-overlay-default)"
      >
        <h2 className="text-text-primary text-lg font-bold">강퇴 되었습니다.</h2>

        <Button
          variant="solid"
          colorScheme="primary"
          size="medium"
          className="w-full"
          onClick={onConfirm}
        >
          확인
        </Button>
      </dialog>
    </Portal>
  );
}
