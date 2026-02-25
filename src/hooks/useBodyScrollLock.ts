"use client";

import { useEffect, useRef } from "react";

interface BodyInlineStyleSnapshot {
  overflow: string;
  position: string;
  top: string;
  left: string;
  right: string;
  width: string;
}

/**
 * 컴포넌트가 마운트된 동안 body 스크롤을 잠그고,
 * 언마운트 시 기존 스타일/스크롤 위치를 복구합니다.
 */
export function useBodyScrollLock() {
  const scrollYRef = useRef(0);
  const bodyStyleRef = useRef<BodyInlineStyleSnapshot | null>(null);

  useEffect(() => {
    const body = document.body;
    scrollYRef.current = window.scrollY;
    bodyStyleRef.current = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
    };

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollYRef.current}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    return () => {
      if (bodyStyleRef.current) {
        body.style.overflow = bodyStyleRef.current.overflow;
        body.style.position = bodyStyleRef.current.position;
        body.style.top = bodyStyleRef.current.top;
        body.style.left = bodyStyleRef.current.left;
        body.style.right = bodyStyleRef.current.right;
        body.style.width = bodyStyleRef.current.width;
      }

      window.scrollTo(0, scrollYRef.current);
    };
  }, []);
}
