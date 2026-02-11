"use client";

import { useEffect, useRef } from "react";

import { useRouter } from "next/navigation";

import { LoginCard } from "@/features/auth/components/LoginCard";

interface LoginModalProps {
  reasonMessage?: string | null;
  nextPath: string;
}

export function LoginModal({ reasonMessage, nextPath }: LoginModalProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleClose = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.replace(nextPath);
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
