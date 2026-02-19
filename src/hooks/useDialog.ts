"use client";

import { useCallback, useEffect, useRef } from "react";

import { useRouter } from "next/navigation";

/**
 * 모달 dialog 공통 로직을 캡슐화하는 커스텀 훅
 *
 * - 마운트 시 자동 showModal() / 언마운트 시 close()
 * - 뒤로가기 / fallback 경로 닫기 처리
 * - backdrop 클릭 닫기
 * - ESC(onCancel) 닫기
 *
 * @param fallbackPath - history가 없을 때 이동할 경로 (기본값: "/")
 */
export function useDialog(fallbackPath: string = "/") {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleClose = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.replace(fallbackPath);
  }, [router, fallbackPath]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.showModal();
    return () => dialog.close();
  }, []);

  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDialogElement>) => {
      if (event.target !== dialogRef.current) return;
      handleClose();
    },
    [handleClose]
  );

  return { dialogRef, handleClose, handleBackdropClick };
}
