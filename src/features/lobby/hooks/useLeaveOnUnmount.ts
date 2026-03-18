"use client";

import { useEffect, useRef } from "react";

interface UseLeaveOnUnmountOptions {
  sessionId: string;
  enabled: boolean;
  isLeavingRef: React.MutableRefObject<boolean>;
  isKicked: boolean;
}

/**
 * 대기방 페이지 이탈 시 leave API를 호출하는 훅
 *
 * - soft navigation(GNB 로고 클릭 등): useEffect cleanup에서 호출
 * - hard navigation(탭 닫기, 새로고침 등): beforeunload 이벤트에서 호출
 * - 정상 나가기/강퇴/세션 전환 시에는 중복 호출을 방지
 */
export function useLeaveOnUnmount({
  sessionId,
  enabled,
  isLeavingRef,
  isKicked,
}: UseLeaveOnUnmountOptions) {
  const isKickedRef = useRef(false);
  const isSessionTransitionRef = useRef(false);

  // isKicked 상태를 ref에 동기화 (cleanup에서 최신 값 참조용)
  useEffect(() => {
    if (isKicked) {
      isKickedRef.current = true;
    }
  }, [isKicked]);

  // 페이지 이탈 시 대기방 leave API 호출
  // 순수 fetch를 사용하는 이유: api.delete()는 AbortController/timeout/retry 등
  // 정상 페이지 컨텍스트용이므로, 페이지 이탈 시 fire-and-forget에는 keepalive fetch가 적합
  useEffect(() => {
    if (!enabled) return;

    const leaveUrl = `/api/sessions/${sessionId}/leave`;

    const shouldSkipLeave = () =>
      isLeavingRef.current || isKickedRef.current || isSessionTransitionRef.current;

    const handleBeforeUnload = () => {
      if (shouldSkipLeave()) return;
      fetch(leaveUrl, { method: "DELETE", keepalive: true, credentials: "include" });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (!shouldSkipLeave()) {
        fetch(leaveUrl, { method: "DELETE", keepalive: true, credentials: "include" });
      }
    };
  }, [enabled, sessionId, isLeavingRef]);

  return { isSessionTransitionRef };
}
