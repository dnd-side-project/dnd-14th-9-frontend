"use client";

import { Button } from "@/components/Button/Button";
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
        <Button
          href="/session/create"
          aria-label="세션 만들기"
          size="small"
          variant="solid"
          colorScheme="primary"
          className="px-xs py-2xs md:px-sm md:py-xs"
          hardNavigate
        >
          세션 만들기
        </Button>
        <ProfileDropdown />
      </>
    );
  }

  if (authState.status === "recovering") {
    return <HeaderAuthLoading />;
  }

  return (
    <Button
      href={LOGIN_ROUTE}
      aria-label="로그인"
      size="small"
      variant="outlined"
      colorScheme="secondary"
      className="px-xs py-2xs md:px-sm md:py-xs"
    >
      회원가입 / 로그인
    </Button>
  );
}
