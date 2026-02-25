"use client";

import { useEffect } from "react";

interface BodyInlineStyleSnapshot {
  overflow: string;
  position: string;
  top: string;
  left: string;
  right: string;
  width: string;
}

let lockCount = 0;
let savedScrollY = 0;
let savedBodyStyle: BodyInlineStyleSnapshot | null = null;

function lockBodyScroll() {
  const body = document.body;

  if (lockCount === 0) {
    savedScrollY = window.scrollY;
    savedBodyStyle = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
    };

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${savedScrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
  }

  lockCount += 1;
}

function unlockBodyScroll() {
  if (lockCount === 0) return;

  lockCount -= 1;
  if (lockCount > 0) return;

  const body = document.body;
  if (savedBodyStyle) {
    body.style.overflow = savedBodyStyle.overflow;
    body.style.position = savedBodyStyle.position;
    body.style.top = savedBodyStyle.top;
    body.style.left = savedBodyStyle.left;
    body.style.right = savedBodyStyle.right;
    body.style.width = savedBodyStyle.width;
  }

  window.scrollTo(0, savedScrollY);
  savedBodyStyle = null;
}

/**
 * 컴포넌트가 마운트된 동안 body 스크롤을 잠그고,
 * 언마운트 시 기존 스타일/스크롤 위치를 복구합니다.
 * 여러 모달이 동시에 열릴 수 있어 참조 카운팅으로 잠금을 관리합니다.
 */
export function useBodyScrollLock(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    lockBodyScroll();

    return () => {
      unlockBodyScroll();
    };
  }, [enabled]);
}
