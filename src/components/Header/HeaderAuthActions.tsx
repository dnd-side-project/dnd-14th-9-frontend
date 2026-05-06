"use client";

import { ButtonLink } from "@/components/Button/ButtonLink";
import { SkeletonBlock } from "@/components/Skeleton/SkeletonBlock";
import { useAuthState } from "@/features/auth/hooks/useAuthState";
import { ProfileDropdown } from "@/features/member/components/ProfileDropdown/ProfileDropdown";
import { LOGIN_ROUTE } from "@/lib/routes/route-paths";

function HeaderAuthLoading() {
  return (
    <div role="status" aria-label="인증 상태 확인 중" className="gap-sm flex items-center">
      <SkeletonBlock className="h-9 w-24 rounded-md" />
      <SkeletonBlock className="h-8 w-8 rounded-full" />
    </div>
  );
}

export function HeaderAuthActions() {
  const authState = useAuthState();

  if (authState.status === "authenticated") {
    return (
      <>
        <ButtonLink
          href="/session/create"
          aria-label="세션 만들기"
          size="small"
          variant="solid"
          colorScheme="primary"
          className="hidden md:inline-flex"
          hardNavigate
        >
          세션 만들기
        </ButtonLink>
        <ButtonLink
          href="/session/create"
          aria-label="세션 만들기"
          size="xsmall"
          variant="solid"
          colorScheme="primary"
          className="md:hidden"
          hardNavigate
        >
          세션 만들기
        </ButtonLink>
        <ProfileDropdown />
      </>
    );
  }

  if (authState.status === "recovering") {
    return <HeaderAuthLoading />;
  }

  return (
    <>
      <ButtonLink
        href={LOGIN_ROUTE}
        aria-label="로그인"
        size="small"
        variant="outlined"
        colorScheme="secondary"
        className="hidden md:inline-flex"
      >
        회원가입 / 로그인
      </ButtonLink>
      <ButtonLink
        href={LOGIN_ROUTE}
        aria-label="로그인"
        size="xsmall"
        variant="outlined"
        colorScheme="secondary"
        className="md:hidden"
      >
        회원가입 / 로그인
      </ButtonLink>
    </>
  );
}
