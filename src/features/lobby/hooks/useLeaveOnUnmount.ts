"use client";

import { useEffect, useRef } from "react";

interface UseLeaveOnUnmountOptions {
  sessionId: string;
  enabled: boolean;
  isLeavingRef: React.RefObject<boolean>;
  isKicked: boolean;
}

/**
 * 대기방 페이지 이탈 시 leave API를 호출하는 훅
 *
 * - soft navigation(GNB 로고 클릭 등): useEffect cleanup에서 호출
 * - hard navigation(탭 닫기/새로고침): leave를 호출하지 않음
 *   브라우저는 새로고침과 탭 닫기를 사전에 구분할 수 없어 beforeunload로 leave를
 *   보내면 새로고침에도 발사되어 본인이 서버에서 제거되는 문제가 있음.
 *   탭 닫기/네트워크 단절로 인한 좀비 멤버는 백엔드의 SSE disconnect 또는
 *   타임아웃 기반 정리로 처리하는 것이 정합성 측면에서 권장됨.
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
  // cleanup에서 예약한 leave 타이머. StrictMode의 모의 언마운트(mount→cleanup→mount)나
  // 빠른 재마운트 시 다음 effect에서 취소하기 위해 ref로 유지한다.
  const pendingLeaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // isKicked 상태를 ref에 동기화 (cleanup에서 최신 값 참조용)
  useEffect(() => {
    if (isKicked) {
      isKickedRef.current = true;
    }
  }, [isKicked]);

  // soft navigation 이탈 시 대기방 leave API 호출
  // keepalive fetch를 사용하는 이유: 라우팅 전환 직전 호출이 페이지 컨텍스트
  // 종료와 겹쳐도 요청이 끊기지 않도록 보장
  useEffect(() => {
    if (!enabled) return;

    // 직전 cleanup이 예약한 leave가 있으면 취소한다.
    // StrictMode 모의 언마운트/재마운트나 warm cache로 인한 즉시 재마운트 시,
    // 실제 이탈이 아님에도 leave가 발사되어 호스트가 세션에서 빠지는 문제를 방지.
    if (pendingLeaveTimerRef.current) {
      clearTimeout(pendingLeaveTimerRef.current);
      pendingLeaveTimerRef.current = null;
    }

    const leaveUrl = `/api/sessions/${sessionId}/leave`;

    const shouldSkipLeave = () =>
      isLeavingRef.current || isKickedRef.current || isSessionTransitionRef.current;

    return () => {
      if (shouldSkipLeave()) return;
      // leave를 매크로태스크로 지연 예약한다. 곧바로 재마운트되면(StrictMode 등)
      // 위의 clearTimeout으로 취소되고, 실제 언마운트에서만 발사된다.
      pendingLeaveTimerRef.current = setTimeout(() => {
        pendingLeaveTimerRef.current = null;
        // 이탈 경로 실패는 의도적으로 무시 (좀비 멤버는 서버 SSE disconnect/타임아웃으로 정리)
        fetch(leaveUrl, { method: "DELETE", keepalive: true, credentials: "include" }).catch(
          () => {}
        );
      }, 0);
    };
  }, [enabled, sessionId, isLeavingRef]);

  return { isSessionTransitionRef };
}
