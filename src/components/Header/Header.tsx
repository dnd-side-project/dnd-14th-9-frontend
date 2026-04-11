"use client";

import Image from "next/image";
import Link from "next/link";

import { ButtonLink } from "@/components/Button/ButtonLink";
import { SkeletonBlock } from "@/components/Skeleton/SkeletonBlock";
import { useAuthState } from "@/features/auth/hooks/useAuthState";
import { ProfileDropdown } from "@/features/member/components/ProfileDropdown/ProfileDropdown";
import { LOGIN_ROUTE, ROOT_ROUTE } from "@/lib/routes/route-paths";

/**
 * Header - GNB (Global Navigation Bar)
 * 공용 auth state 기준으로 우측 액션 영역을 렌더링합니다.
 */
function HeaderAuthLoading() {
  return (
    <div role="status" aria-label="인증 상태 확인 중" className="gap-sm flex items-center">
      <SkeletonBlock className="h-9 w-24 rounded-md" />
      <SkeletonBlock className="h-8 w-8 rounded-full" />
    </div>
  );
}

export function Header() {
  const authState = useAuthState();

  return (
    <header className="border-border-subtle bg-surface-default sticky top-0 z-50 w-full border-b">
      <div className="px-lg md:px-xl md:py-sm mx-auto flex h-full max-w-[1280px] items-center justify-between py-[15px] xl:px-[50px]">
        <Link
          href={ROOT_ROUTE}
          aria-label="홈으로 이동"
          className="focus-visible:ring-primary transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none"
        >
          <Image
            src="/header-logo.svg"
            alt="GAK"
            width={90}
            height={24}
            className="h-4 w-[60px] md:h-6 md:w-[90px]"
            priority
          />
        </Link>

        <div className="gap-sm flex items-center justify-end">
          {authState.status === "authenticated" ? (
            <>
              <ButtonLink
                href="/session/create"
                aria-label="세션 만들기"
                size="small"
                variant="solid"
                colorScheme="primary"
                className="px-xs py-2xs md:px-sm md:py-xs"
                hardNavigate
              >
                세션 만들기
              </ButtonLink>
              <ProfileDropdown />
            </>
          ) : authState.status === "recovering" ? (
            <HeaderAuthLoading />
          ) : (
            <ButtonLink
              href={LOGIN_ROUTE}
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
      </div>
    </header>
  );
}
