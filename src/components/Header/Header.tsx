import Link from "next/link";

import { ButtonLink } from "@/components/ButtonLink/ButtonLink";
import { ProfileDropdown } from "@/components/Header/ProfileDropdown";
import { getServerAuthState } from "@/lib/auth/server";

/**
 * Header - GNB (Global Navigation Bar) 서버 컴포넌트
 * httpOnly 쿠키에서 인증 상태를 읽어 UI를 렌더링합니다.
 */
export async function Header() {
  const isAuthenticated = await getServerAuthState();

  return (
    <header className="border-border-subtle bg-surface-default px-lg md:px-xl md:py-sm mx-auto flex h-full max-w-[1280px] items-center justify-between border-b py-[15px] lg:px-[50px]">
      <Link
        href="/"
        aria-label="홈으로 이동"
        className="text-common-white focus-visible:ring-primary text-[27px] leading-[120%] font-bold transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none"
      >
        GAK
      </Link>

      <div className="gap-sm flex items-center justify-end">
        {isAuthenticated ? (
          <>
            <ButtonLink
              href="/session/create"
              aria-label="세션 만들기"
              size="small"
              variant="solid"
              colorScheme="primary"
              className="px-xs py-2xs md:px-sm md:py-xs"
            >
              세션 만들기
            </ButtonLink>
            <ProfileDropdown />
          </>
        ) : (
          <ButtonLink
            href="/login"
            aria-label="로그인"
            size="small"
            variant="outlined"
            colorScheme="secondary"
            className="px-xs py-2xs md:px-sm md:py-xs"
          >
            회원가입 / 로그인
          </ButtonLink>
        )}
      </div>
    </header>
  );
}
