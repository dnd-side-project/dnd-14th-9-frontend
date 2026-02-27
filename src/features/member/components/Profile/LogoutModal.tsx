"use client";

import { useCallback, useRef } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/Button/Button";
import { Portal } from "@/components/Portal/Portal";
import { useLogout } from "@/features/auth/hooks/useAuthHooks";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { getApiErrorMessage } from "@/lib/error/api-error-utils";
import { toast } from "@/lib/toast";

interface LogoutModalProps {
  onClose: () => void;
}

export function LogoutModal({ onClose }: LogoutModalProps) {
  useBodyScrollLock();
  const router = useRouter();

  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const setDialogRef = useCallback((node: HTMLDialogElement | null) => {
    if (node && !node.open) {
      node.showModal();
    }
    dialogRef.current = node;
  }, []);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target !== dialogRef.current) return;
    if (isLoggingOut) return;
    onClose();
  };

  const handleLogout = () => {
    if (isLoggingOut) return;

    logout(undefined, {
      onSuccess: () => {
        onClose();
        router.replace("/");
        router.refresh();
      },
      onError: (error: unknown) => {
        toast.error(getApiErrorMessage(error));
      },
    });
  };

  return (
    <Portal>
      <dialog
        ref={setDialogRef}
        onCancel={(e) => {
          e.preventDefault();
          if (!isLoggingOut) onClose();
        }}
        onClick={handleBackdropClick}
        className="bg-surface-default p-3xl border-border-default fixed inset-0 m-auto flex w-full max-w-[440px] flex-col gap-16 rounded-lg border backdrop:bg-(--color-overlay-default)"
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-text-primary text-2xl font-bold">로그아웃하시겠어요?</h2>
          <p className="text-text-secondary font-regular text-base">
            모든 브라우저에서 로그아웃돼요.
          </p>
        </div>

        <div className="gap-md flex w-full">
          <Button
            variant="solid"
            colorScheme="tertiary"
            size="medium"
            className="flex-1"
            onClick={onClose}
            disabled={isLoggingOut}
          >
            취소
          </Button>
          <Button
            variant="solid"
            colorScheme="primary"
            size="medium"
            className="flex-1"
            onClick={handleLogout}
            disabled={isLoggingOut}
            aria-busy={isLoggingOut}
          >
            {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
          </Button>
        </div>
      </dialog>
    </Portal>
  );
}
