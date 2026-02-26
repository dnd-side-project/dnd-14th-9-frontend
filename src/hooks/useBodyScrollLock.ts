"use client";

import { useEffect } from "react";

/** layout의 스크롤 컨테이너 id와 동기화하기 위한 상수 */
export const MAIN_SCROLL_ID = "main-scroll";

/** 현재 활성화된 잠금 수 (중첩 모달 대응용 참조 카운터) */
let lockCount = 0;

/**
 * main 스크롤 컨테이너의 스크롤을 잠그고 inert 처리하여
 * 모달 뒤쪽 콘텐츠의 스크롤과 상호작용을 차단합니다.
 * 여러 모달이 동시에 열릴 수 있어 참조 카운팅으로 잠금을 관리합니다.
 *
 * 스크롤 주체가 body가 아닌 #main-scroll 컨테이너이므로,
 * iOS Safari에서 body overflow: hidden이 무시되는 문제가 원천적으로 발생하지 않으며
 * position: fixed + 스크롤 위치 저장/복원 워크어라운드가 불필요합니다.
 */
export function useBodyScrollLock(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const el = document.getElementById(MAIN_SCROLL_ID);
    if (!el) return;

    // 참조 카운트 증가 — 첫 번째 잠금 요청일 때만 실제 잠금 적용
    lockCount += 1;
    if (lockCount === 1) {
      // overflow: hidden으로 스크롤 차단 (.scroll-lock은 globals.css에 정의)
      el.classList.add("scroll-lock");
      // inert로 포커스·클릭·스크린리더 접근 차단
      el.inert = true;
    }

    return () => {
      // 참조 카운트 감소 — 모든 잠금이 해제되었을 때만 복원
      lockCount -= 1;
      if (lockCount === 0) {
        el.classList.remove("scroll-lock");
        el.inert = false;
      }
    };
  }, [enabled]);
}
