"use client";

import { useEffect, useId, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { ProfileIcon } from "@/components/Icon/ProfileIcon";
import { ProfilePopup } from "@/features/member/components/ProfilePopup/ProfilePopup";

/**
 * TODO(이경환): 임시 프로필 패널 컴포넌트입니다.
 * 디자인 확정 후 피그마 시안 기준으로 전체 UI/인터랙션을 교체하세요.
 */
export function ProfileDropdown() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div ref={containerRef} className="relative z-50">
      <button
        type="button"
        aria-label="프로필 메뉴"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={() => setIsOpen((prev) => !prev)}
        className="border-border-subtle bg-surface-subtle focus-visible:ring-primary focus-visible flex h-8 w-8 items-center justify-center rounded-full border p-2 transition-colors focus-visible:outline-none"
      >
        <ProfileIcon className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+12px)] right-0 z-50 shadow-xl">
          <ProfilePopup
            name="빵가루 요정 쥐이" // TODO: 실제 데이터 연동 필요
            email="sewonlim9060@naver.com" // TODO: 실제 데이터 연동 필요
            focusTimeMinutes={30} // TODO: 실제 데이터 연동 필요
            totalTimeMinutes={60} // TODO: 실제 데이터 연동 필요
            todoCompleted={8} // TODO: 실제 데이터 연동 필요
            todoTotal={10} // TODO: 실제 데이터 연동 필요
            onClose={() => setIsOpen(false)}
            onLogoutClick={handleLogout}
            onProfileSettingsClick={() => console.log("Profile Settings Clicked")}
            onReportClick={() => console.log("Report Clicked")}
            onFeedbackClick={() => console.log("Feedback Clicked")}
          />
        </div>
      )}
    </div>
  );
}
