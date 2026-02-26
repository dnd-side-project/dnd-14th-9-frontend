import { cookies } from "next/headers";

import { ErrorFallbackUI } from "@/components/Error/ErrorFallbackUI";
import { Header } from "@/components/Header/Header";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth/cookie-constants";

export default async function NotFound() {
  const cookieStore = await cookies();
  const isAuthenticated = Boolean(
    cookieStore.get(ACCESS_TOKEN_COOKIE)?.value || cookieStore.get(REFRESH_TOKEN_COOKIE)?.value
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header isAuthenticated={isAuthenticated} />
      <main className="gap-2xl mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center md:px-[250px]">
        <ErrorFallbackUI
          title="Page not found"
          description={
            "Ooops.. 요청하신 페이지가 삭제되었거나 주소가 변경되었어요.\n다른 모집 중인 세션을 둘러보실래요?"
          }
          buttonLabel="홈으로 가기"
          href="/"
        />
      </main>
    </div>
  );
}
