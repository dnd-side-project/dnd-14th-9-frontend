"use client";

import { useCallback, useState } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/Button/Button";
import { ChevronRightIcon } from "@/components/Icon/ChevronRightIcon";
import { useLogout } from "@/features/auth/hooks/useAuthHooks";
import { useDeleteAccountFlow } from "@/features/member/hooks/useDeleteAccountFlow";
import { useMe } from "@/features/member/hooks/useMemberHooks";
import { getApiErrorMessage } from "@/lib/error/api-error-utils";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils/utils";

import { AccountProfileCard } from "./AccountProfileCard";
import { DeleteAccountAgreement } from "./DeleteAccountAgreement";
import { DeleteAccountWarnings } from "./DeleteAccountWarnings";

// ─── 로컬 컴포넌트 ────────────────────────────────────────────────────────────────

interface SidebarNavButtonProps {
  isActive?: boolean;
  isPending?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

/** 사이드바 내비게이션 버튼. isActive로 선택/비선택 스타일을 제어합니다. */
function SidebarNavButton({
  isActive = false,
  isPending,
  onClick,
  children,
}: SidebarNavButtonProps) {
  return (
    <Button
      type="button"
      variant="solid"
      colorScheme="tertiary"
      size="large"
      rightIcon={<ChevronRightIcon />}
      onClick={onClick}
      disabled={isPending}
      aria-busy={isPending}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "text-text-primary py-md pr-md pl-lg gap-[160px] border text-[14px] font-semibold",
        isActive ? "border-border-strong" : "bg-surface-default border-border-default"
      )}
    >
      {children}
    </Button>
  );
}

// ─── 메인 컴포넌트 ───────────────────────────────────────────────────────────────

export function ProfileAccountContent() {
  const router = useRouter();
  const [isAgreed, setIsAgreed] = useState(false);
  const { data, isPending: isProfilePending } = useMe();
  const profile = data?.result;
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { deleteAccount, isDeleting } = useDeleteAccountFlow();

  const handleLogout = useCallback(() => {
    if (isLoggingOut) return;

    logout(undefined, {
      onSuccess: () => {
        router.replace("/");
        router.refresh();
      },
      onError: (error: unknown) => {
        toast.error(getApiErrorMessage(error));
      },
    });
  }, [isLoggingOut, logout, router]);

  return (
    <div className="flex flex-col items-center gap-32">
      <div className="gap-xl flex w-full flex-col">
        <h4 className="text-text-primary text-lg font-bold">계정 관리</h4>
        <div className="gap-lg flex w-full">
          <aside className="gap-sm flex flex-col">
            <SidebarNavButton isActive>회원 탈퇴</SidebarNavButton>
            <SidebarNavButton isPending={isLoggingOut} onClick={handleLogout}>
              {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
            </SidebarNavButton>
          </aside>
          <div className="px-3xl flex flex-1 flex-col gap-20">
            <DeleteAccountWarnings />
            <AccountProfileCard profile={profile} isLoading={isProfilePending} />
            <DeleteAccountAgreement onAgreementChange={setIsAgreed} />
          </div>
        </div>
      </div>
      <Button
        type="button"
        variant="solid"
        colorScheme="primary"
        size="large"
        disabled={!isAgreed || isDeleting || !profile}
        aria-busy={isDeleting}
        onClick={deleteAccount}
      >
        {isDeleting ? "탈퇴 중..." : "회원 탈퇴하기"}
      </Button>
    </div>
  );
}
