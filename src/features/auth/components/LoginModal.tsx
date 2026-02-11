"use client";

import { useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { LoginCard } from "@/features/auth/components/LoginCard";
import { clearCookie, getCookie } from "@/lib/auth/client-cookies";
import { LOGIN_ERROR_COOKIE } from "@/lib/auth/cookie-constants";
import { getLoginReasonMessage } from "@/lib/auth/login-policy";

interface LoginModalProps {
  nextPath: string;
}

export function LoginModal({ nextPath }: LoginModalProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);

  // 초기 렌더링 시 에러 쿠키 확인 및 1회성 소비
  const [errorMessage] = useState<string | null>(() => {
    const errorReason = getCookie(LOGIN_ERROR_COOKIE);
    if (errorReason) {
      clearCookie(LOGIN_ERROR_COOKIE);
      return getLoginReasonMessage(errorReason);
    }
    return null;
  });

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
      <LoginCard reasonMessage={errorMessage} nextPath={nextPath} onClose={handleClose} />
    </dialog>
  );
}
