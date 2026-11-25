"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import { Avatar } from "@/components/Avatar/Avatar";
import { useLogout } from "@/features/auth/hooks/useAuthHooks";

import { useProfileDropdownDialog } from "../../hooks/useProfileDropdownDialog";

import { ProfilePopupSkeleton } from "./ProfilePopupSkeleton";

import type { MemberProfileView } from "../../types";

const loadProfilePopup = () => import("@/features/member/components/ProfileDropdown/ProfilePopup");

const ProfilePopup = dynamic(() => loadProfilePopup().then((mod) => mod.ProfilePopup), {
  ssr: false,
  loading: () => <ProfilePopupSkeleton />,
});

interface ProfileDropdownProps {
  profile: MemberProfileView;
}

export function ProfileDropdown({ profile }: ProfileDropdownProps) {
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
        <>
          <Avatar
            type={profile.profileImageUrl ? "image" : "empty"}
            src={profile.profileImageUrl ?? undefined}
            alt={profile.nickname}
            size="medium"
            className="hidden md:inline-flex"
          />
          <Avatar
            type={profile.profileImageUrl ? "image" : "empty"}
            src={profile.profileImageUrl ?? undefined}
            alt={profile.nickname}
            size="small"
            className="md:hidden"
          />
        </>
      </button>

      {isOpen && (
        <div
          id={dialogId}
          ref={dialogRef}
          role="dialog"
          aria-modal="false"
          aria-labelledby={dialogTitleId}
          tabIndex={-1}
          className="absolute top-[calc(100%+20px)] right-0 z-50 max-w-[calc(100vw-2rem)] shadow-xl"
        >
          <h2 id={dialogTitleId} className="sr-only">
            프로필 메뉴
          </h2>
          <ProfilePopup profile={profile} onClose={closeDropdown} onLogoutClick={handleLogout} />
        </div>
      )}
    </div>
  );
}
