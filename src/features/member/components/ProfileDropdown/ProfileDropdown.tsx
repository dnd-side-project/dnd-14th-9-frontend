"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import { Avatar } from "@/components/Avatar/Avatar";
import { useMe } from "@/features/member/hooks/useMemberHooks";

import { useProfileDropdownDialog } from "../../hooks/useProfileDropdownDialog";

const loadProfilePopup = () => import("@/features/member/components/ProfileDropdown/ProfilePopup");

const ProfilePopup = dynamic(() => loadProfilePopup().then((mod) => mod.ProfilePopup), {
  ssr: false,
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

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      closeDropdown();
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handlePrefetchPopup = () => {
    void loadProfilePopup();
  };

  const popupContent = isPending ? (
    <div className="bg-surface-default text-text-secondary min-w-[220px] rounded-md border border-gray-700 p-4 text-sm">
      프로필 정보를 불러오는 중입니다.
    </div>
  ) : isError ? (
    <div className="bg-surface-default text-text-secondary min-w-[220px] rounded-md border border-gray-700 p-4 text-sm">
      프로필 정보를 불러오지 못했습니다.
    </div>
  ) : !profile ? (
    <div className="bg-surface-default text-text-secondary min-w-[220px] rounded-md border border-gray-700 p-4 text-sm">
      프로필 정보가 없습니다.
    </div>
  ) : (
    <ProfilePopup profile={profile} onClose={closeDropdown} onLogoutClick={handleLogout} />
  );

  return (
    <div ref={containerRef} className="relative z-50">
      <button
        ref={triggerRef}
        type="button"
        aria-label="프로필 메뉴"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls={dialogId}
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
          className="absolute top-[calc(100%+12px)] right-0 z-50 shadow-xl"
        >
          <h2 id={dialogTitleId} className="sr-only">
            프로필 메뉴
          </h2>
          {popupContent}
        </div>
      )}
    </div>
  );
}
