import Image from "next/image";
import Link from "next/link";

import { ButtonLink } from "@/components/Button/ButtonLink";
import { ProfileDropdown } from "@/features/member/components/ProfileDropdown/ProfileDropdown";

interface HeaderProps {
  isAuthenticated: boolean;
}

/**
 * Header - GNB (Global Navigation Bar) 서버 컴포넌트
 * 상위 레이아웃에서 주입된 인증 상태에 따라 UI를 렌더링합니다.
 */
export function Header({ isAuthenticated }: HeaderProps) {
  return (
    <header className="border-border-subtle bg-surface-default sticky top-0 z-50 w-full border-b">
      <div className="px-lg md:px-xl md:py-sm mx-auto flex h-full max-w-[1280px] items-center justify-between py-[15px] xl:px-[50px]">
        <Link
          href="/"
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
          {isAuthenticated ? (
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
      </div>
    </header>
  );
}
