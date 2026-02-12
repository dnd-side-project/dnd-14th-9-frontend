"use client";

import { useEffect, useId, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { ProfileIcon } from "@/components/Icon/ProfileIcon";

/**
 * TODO(이경환): 임시 프로필 패널 컴포넌트입니다.
 * 디자인 확정 후 피그마 시안 기준으로 전체 UI/인터랙션을 교체하세요.
 */
export function ProfileDropdown() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const dialogId = useId();
  const dialogTitleId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      const response = await fetch("/api/auth/logout", { method: "POST" });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="프로필 메뉴"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls={dialogId}
        onClick={() => setIsOpen((prev) => !prev)}
        className="border-border-subtle bg-surface-subtle focus-visible:ring-primary focus-visible:outline- focus-visibl flex h-8 w-8 items-center justify-center rounded-full border p-2 transition-colors"
      >
        <ProfileIcon size="xsmall" />
      </button>

      {isOpen ? (
        <div
          id={dialogId}
          role="dialog"
          aria-modal="false"
          aria-labelledby={dialogTitleId}
          className="bg-surface-subtle border-border-subtle p-sm absolute top-[calc(100%+8px)] right-0 z-10 min-w-[128px] rounded-md border shadow-lg"
        >
          <h2 id={dialogTitleId} className="sr-only">
            프로필 패널
          </h2>
          <button
            type="button"
            aria-label="로그아웃"
            disabled={isLoggingOut}
            onClick={handleLogout}
            className="text-text-primary hover:bg-surface-subtler focus-visible:ring-primary px-sm py-xs flex w-full items-center justify-center rounded-sm text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
