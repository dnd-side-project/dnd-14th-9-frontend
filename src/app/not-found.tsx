import { cookies } from "next/headers";

import { ButtonLink } from "@/components/Button/ButtonLink";
import { Header } from "@/components/Header/Header";
import { AlertIcon } from "@/components/Icon/AlertIcon";
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
        <div className="flex w-full shrink-0 flex-col items-center">
          <div className="flex w-full shrink-0 items-center justify-center px-16 py-5">
            <div className="relative size-[120px] shrink-0">
              <AlertIcon className="text-text-primary h-[120px] w-[120px]" />
            </div>
          </div>
          <p className="text-text-primary text-center text-[44px] font-bold">Page not found</p>
        </div>

        <div className="font-regular text-text-muted min-w-full shrink-0 text-center text-[18px] leading-[1.4] whitespace-pre-wrap">
          <p className="mb-0">Ooops.. 요청하신 페이지가 삭제되었거나 주소가 변경되었어요.</p>
          <p>다른 모집 중인 세션을 둘러보실래요?</p>
        </div>

        <ButtonLink href="/" variant="solid" colorScheme="tertiary" size="large">
          홈으로 가기
        </ButtonLink>
      </main>
    </div>
  );
}
