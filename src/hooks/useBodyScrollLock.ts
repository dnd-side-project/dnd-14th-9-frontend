"use client";

import { useEffect } from "react";

export const MAIN_SCROLL_ID = "main-scroll";

let lockCount = 0;

/**
 * main 스크롤 컨테이너의 스크롤을 잠그고,
 * 언마운트 시 복구합니다.
 * 여러 모달이 동시에 열릴 수 있어 참조 카운팅으로 잠금을 관리합니다.
 */
export function useBodyScrollLock(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const el = document.getElementById(MAIN_SCROLL_ID);
    if (!el) return;

    lockCount += 1;
    if (lockCount === 1) {
      el.style.overflow = "hidden";
    }

    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        el.style.overflow = "";
      }
    };
  }, [enabled]);
}
