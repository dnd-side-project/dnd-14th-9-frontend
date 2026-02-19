"use client";

import { LoginCard } from "@/features/auth/components/LoginCard";
import { useDialog } from "@/hooks/useDialog";

interface LoginModalProps {
  nextPath: string;
  reasonMessage?: string | null;
}

export function LoginModal({ nextPath, reasonMessage }: LoginModalProps) {
  const { dialogRef, handleClose, handleBackdropClick } = useDialog(nextPath);

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleClose}
      onClick={handleBackdropClick}
      className="fixed inset-0 m-auto max-w-[360px] rounded-lg bg-transparent p-0 backdrop:bg-(--color-overlay-default) md:max-w-[400px] lg:max-w-[440px]"
    >
      <LoginCard reasonMessage={reasonMessage} nextPath={nextPath} onClose={handleClose} />
    </dialog>
  );
}
