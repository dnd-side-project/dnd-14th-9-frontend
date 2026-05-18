"use client";

import { useEffect, useState } from "react";

import { BREAKPOINT_MD_PX, BREAKPOINT_XL_PX } from "@/lib/constants/breakpoints";

export type ViewportLayout = "mobile" | "tablet" | "desktop";

interface ViewportLayoutState {
  layout: ViewportLayout;
  isResolved: boolean;
}

// viewport 너비를 Tailwind breakpoint와 같은 기준의 레이아웃 이름으로 변환합니다.
function getViewportLayout(width: number | null): ViewportLayout {
  if (width === null || width >= BREAKPOINT_XL_PX) {
    return "desktop";
  }

  if (width < BREAKPOINT_MD_PX) {
    return "mobile";
  }

  return "tablet";
}

/**
 * 현재 브라우저 viewport가 프로젝트 breakpoint 기준으로 어떤 레이아웃인지 알려주는 훅입니다.
 *
 * `ResizeObserver`는 특정 DOM 요소의 크기를 관찰할 때 적합하지만,
 * 이 훅은 요소가 아닌 브라우저 viewport 너비(`window.innerWidth`)가 필요하므로 window resize 이벤트를 사용합니다.
 *
 * SSR/hydration 단계처럼 아직 viewport를 알 수 없는 시점에는 desktop 레이아웃을 fallback으로 반환하고,
 * 클라이언트에서 실제 너비를 읽은 뒤 `isResolved`를 true로 전환합니다.
 */
export function useViewportLayout(): ViewportLayoutState {
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    const updateWidth = () => {
      setWidth(window.innerWidth);
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);

    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  return {
    layout: getViewportLayout(width),
    isResolved: width !== null,
  };
}
