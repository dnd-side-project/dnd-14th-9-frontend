import Link from "next/link";

import { ButtonLink } from "@/components/ButtonLink/ButtonLink";
import { ProfileIcon } from "@/components/Icon/ProfileIcon";
import { getServerAuthState } from "@/lib/auth/server";

/**
 * Header - GNB (Global Navigation Bar) 서버 컴포넌트
 * httpOnly 쿠키에서 인증 상태를 읽어 UI를 렌더링합니다.
 */
export async function Header() {
  const isAuthenticated = await getServerAuthState();

  return (
    <header className="border-border-subtle bg-surface-default py-sm mx-auto flex h-full max-w-screen-2xl items-center justify-between border-b px-[50px]">
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
              size="xsmall"
              variant="solid"
              colorScheme="primary"
            >
              세션 만들기
            </ButtonLink>

            <button
              type="button"
              disabled
              aria-label="프로필 메뉴"
              className="border-border-subtle hover:bg-surface-subtle focus-visible:ring-primary flex h-8 w-8 items-center justify-center rounded-full border transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ProfileIcon size="medium" />
            </button>
          </>
        ) : (
          <ButtonLink
            href="/login"
            aria-label="로그인"
            size="small"
            variant="outlined"
            colorScheme="secondary"
          >
            회원가입 / 로그인
          </ButtonLink>
        )}
      </div>
    </header>
  );
}
