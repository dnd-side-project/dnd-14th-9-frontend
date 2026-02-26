import { useEffect, useRef, useState } from "react";

/**
 * 브라우저 뒤로 가기를 감지하여 이탈 확인 다이얼로그를 표시하는 훅
 *
 * - popstate 이벤트를 가로채 더미 히스토리 엔트리를 추가하여 뒤로 가기를 방지
 * - isLeavingRef가 true이면 (이탈 확인 후) popstate를 무시
 */
export function usePreventBackNavigation() {
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const isLeavingRef = useRef(false);

  useEffect(() => {
    const handlePopState = () => {
      if (isLeavingRef.current) return;
      setShowLeaveDialog(true);
      // 뒤로 가기를 취소하기 위해 더미 엔트리 재추가 (go(1)은 Next.js 라우터와 충돌하여 새로고침 발생)
      window.history.pushState({ preventBack: true }, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);

    // 히스토리 엔트리 추가 (뒤로 가기 시 go(1)로 돌아올 수 있도록)
    window.history.pushState({ preventBack: true }, "", window.location.href);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return { showLeaveDialog, setShowLeaveDialog, isLeavingRef };
}
