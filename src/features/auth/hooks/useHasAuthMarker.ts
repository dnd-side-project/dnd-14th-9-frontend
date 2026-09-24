"use client";

import { useSyncExternalStore } from "react";

import { AUTH_MARKER_COOKIE } from "@/lib/auth/cookie-constants";

// 마커는 서버 응답(Set-Cookie)으로만 바뀌고, 바뀐 뒤에는 항상 재렌더가 따라오므로 구독할 이벤트가 없다.
function subscribe() {
  return () => {};
}

function getSnapshot(): boolean {
  return document.cookie.split("; ").some((cookie) => cookie.startsWith(`${AUTH_MARKER_COOKIE}=`));
}

// 정적 HTML은 모든 사용자에게 같으므로 서버에서는 알 수 없음(null)으로 두고, hydration 직후 실제 값으로 바뀐다.
function getServerSnapshot(): null {
  return null;
}

/**
 * 인증 마커 쿠키 존재 여부를 반환한다. 서버 렌더와 hydration 중에는 null(판단 불가)이다.
 */
export function useHasAuthMarker(): boolean | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
