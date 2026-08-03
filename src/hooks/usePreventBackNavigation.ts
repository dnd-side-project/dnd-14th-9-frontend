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
    // Next.js app-router가 히스토리 엔트리에 심는 내부 상태(__NA, tree)를 보존한 채
    // 같은 URL로 더미 엔트리를 추가한다.
    // - 내부 상태가 없는 엔트리에서 popstate가 발생하면 Next.js가 window.location.reload()로
    //   처리하여 다이얼로그가 뜨자마자 사라진다 (next/dist/client/components/app-router.js onPopState).
    // - url 인자를 생략해 Next.js의 패치된 pushState가 불필요한 라우터 액션(ACTION_RESTORE)을
    //   디스패치하지 않도록 한다.
    const pushGuardEntry = () => {
      window.history.pushState({ ...window.history.state, preventBack: true }, "");
    };

    const handlePopState = () => {
      if (isLeavingRef.current) return;
      setShowLeaveDialog(true);
      // 뒤로 가기를 취소하기 위해 더미 엔트리 재추가 (go(1)은 Next.js 라우터와 충돌하여 새로고침 발생)
      pushGuardEntry();
    };

    window.addEventListener("popstate", handlePopState);

    // 히스토리 엔트리 추가 (뒤로 가기 트랩).
    // 현재 엔트리가 이미 더미면 중복 추가하지 않는다 — StrictMode 재마운트나
    // 수정 페이지 왕복 복귀(더미 엔트리 위에서 페이지 복원) 시 더미가 계속 쌓이는 것을 막고,
    // 직접 진입과 왕복 복귀의 히스토리 구조를 동일하게 유지한다.
    if (!window.history.state?.preventBack) {
      pushGuardEntry();
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return { showLeaveDialog, setShowLeaveDialog, isLeavingRef };
}
