"use client";

import { useEffect, useId, useRef, useState } from "react";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import { ProfileIcon } from "@/components/Icon/ProfileIcon";
import { useMe } from "@/features/member/hooks/useMemberHooks";

const loadProfilePopup = () => import("@/features/member/components/ProfilePopup/ProfilePopup");

const ProfilePopup = dynamic(() => loadProfilePopup().then((mod) => mod.ProfilePopup), {
  ssr: false,
});

/**
 * TODO(이경환): 임시 프로필 패널 컴포넌트입니다.
 * 디자인 확정 후 피그마 시안 기준으로 전체 UI/인터랙션을 교체하세요.
 */
export function ProfileDropdown() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const dialogId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const { data, isPending, isError } = useMe();
  const profile = data?.result;

  const closeDropdown = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!isOpen) return;

    dialogRef.current?.focus();

    const handleClickOutside = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDropdown();
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen]);

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

  const renderFallback = (message: string) => (
    <div className="bg-surface-default text-text-secondary min-w-[220px] rounded-md border border-gray-700 p-4 text-sm">
      {message}
    </div>
  );

  const renderPopupContent = () => {
    if (isPending) {
      return renderFallback("프로필 정보를 불러오는 중입니다.");
    }

    if (isError) {
      return renderFallback("프로필 정보를 불러오지 못했습니다.");
    }

    if (!profile) {
      return renderFallback("프로필 정보가 없습니다.");
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
        onClick={() => setIsOpen((prev) => !prev)}
        className="border-border-subtle bg-surface-subtle focus-visible:ring-primary focus-visible flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border p-2 transition-colors focus-visible:outline-none"
      >
        <ProfileIcon className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          id={dialogId}
          ref={dialogRef}
          role="dialog"
          aria-modal="false"
          aria-label="프로필 메뉴"
          tabIndex={-1}
          className="absolute top-[calc(100%+12px)] right-0 z-50 shadow-xl"
        >
          {renderPopupContent()}
        </div>
      )}
    </div>
  );
}
