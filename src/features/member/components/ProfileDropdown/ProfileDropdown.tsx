"use client";

import type { ReactNode } from "react";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import { Avatar } from "@/components/Avatar/Avatar";
import { AlertIcon } from "@/components/Icon/AlertIcon";
import { useLogout } from "@/features/auth/hooks/useAuthHooks";
import { useMe } from "@/features/member/hooks/useMemberHooks";
import { cn } from "@/lib/utils/utils";

import { useProfileDropdownDialog } from "../../hooks/useProfileDropdownDialog";

import { ProfilePopupSkeleton } from "./ProfilePopupSkeleton";

interface PopupStatusMessageProps {
  children: ReactNode;
  icon?: ReactNode;
  variant?: "default" | "error";
}

function PopupStatusMessage({ children, icon, variant = "default" }: PopupStatusMessageProps) {
  return (
    <div className="border-border-default bg-surface-default min-w-[220px] rounded-md border p-4">
      <div
        className={cn(
          "flex items-center gap-2 text-sm",
          variant === "error" ? "text-red-400" : "text-text-secondary"
        )}
      >
        {icon}
        {children}
      </div>
    </div>
  );
}

const loadProfilePopup = () => import("@/features/member/components/ProfileDropdown/ProfilePopup");

const ProfilePopup = dynamic(() => loadProfilePopup().then((mod) => mod.ProfilePopup), {
  ssr: false,
  loading: () => <ProfilePopupSkeleton />,
});

export function ProfileDropdown() {
  const router = useRouter();

  const {
    isOpen,
    dialogId,
    dialogTitleId,
    containerRef,
    triggerRef,
    dialogRef,
    closeDropdown,
    toggleDropdown,
  } = useProfileDropdownDialog();
  const { data, isPending, isError } = useMe();
  const profile = data?.result;
  const { mutate: logout } = useLogout();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        closeDropdown();
        router.refresh();
      },
      onError: (error) => {
        console.error("Logout error:", error);
      },
    });
  };

  const handlePrefetchPopup = () => {
    void loadProfilePopup();
  };

  const renderPopupContent = () => {
    if (isPending) {
      return <ProfilePopupSkeleton />;
    }

    if (isError) {
      return (
        <PopupStatusMessage variant="error" icon={<AlertIcon className="h-4 w-4 shrink-0" />}>
          프로필 정보를 불러오지 못했습니다.
        </PopupStatusMessage>
      );
    }

    if (!profile) {
      return (
        <PopupStatusMessage icon={<AlertIcon className="h-4 w-4 shrink-0" />}>
          프로필 정보가 없습니다.
        </PopupStatusMessage>
      );
    }

    return <ProfilePopup profile={profile} onClose={closeDropdown} onLogoutClick={handleLogout} />;
  };

  return (
    <div ref={containerRef} className="relative z-50">
      <button
        ref={triggerRef}
        type="button"
        aria-label="프로필 메뉴"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls={isOpen ? dialogId : undefined}
        onMouseEnter={handlePrefetchPopup}
        onFocus={handlePrefetchPopup}
        onClick={toggleDropdown}
        className="focus-visible:ring-primary flex cursor-pointer rounded-full transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none"
      >
        <Avatar
          type={profile?.profileImageUrl ? "image" : "empty"}
          src={profile?.profileImageUrl ?? undefined}
          alt={profile?.nickname ?? "프로필"}
          size="medium"
          className="h-8 w-8"
        />
      </button>

      {isOpen && (
        <div
          id={dialogId}
          ref={dialogRef}
          role="dialog"
          aria-modal="false"
          aria-labelledby={dialogTitleId}
          tabIndex={-1}
          className="absolute top-[calc(100%+20px)] right-0 z-50 shadow-xl"
        >
          <h2 id={dialogTitleId} className="sr-only">
            프로필 메뉴
          </h2>
          {renderPopupContent()}
        </div>
      )}
    </div>
  );
}
