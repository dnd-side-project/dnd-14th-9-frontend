"use client";

import { useEffect } from "react";

import { ErrorFallbackUI } from "@/components/Error/ErrorFallbackUI";
import { Header } from "@/components/Header/Header";

// error 컴포넌트는 클라이언트 컴포넌트여야 하므로 auth 쿠키에 직접 접근하지 못합니다.
// 전역 Header를 띄우기 위해 단순히 인증 상태를 false로 두거나 클라이언트에서 조회할 수 있습니다.
// 하지만 사용자 경험상 에러 발생 시 최상위 레이아웃을 깰 수 없으므로 우선 기본 헤더를 노출합니다.

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 필요 시 에러 리포팅 서비스(Sentry 등)에 에러 객체를 전달합니다.
    console.error(error);
  }, [error]);

  return (
    <div className="bg-surface-default flex min-h-screen flex-col">
      <Header isAuthenticated={false} />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-8 px-4 py-20 md:px-[250px]">
        <ErrorFallbackUI
          title="Not found"
          description={"Ooops.. 서비스 이용이 원활하지 않아요.\n잠시 후 다시 시도해주실래요?"}
          buttonLabel="다시 시도"
          onRetry={() => reset()}
        />
      </main>
    </div>
  );
}
