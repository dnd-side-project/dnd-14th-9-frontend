"use client";

import { authApi } from "@/features/auth/api";
import { useAuthStore } from "@/stores/authStore";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

/**
 * Header - 공통 헤더/네비게이션
 *
 * TODO(이경환): 디자인 확정 후 구현
 * - 로고
 * - 네비게이션 메뉴
 * - 로그인/로그아웃 버튼
 */
export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const openLogin = () => {
    const query = searchParams.toString();
    const nextPath = `${pathname}${query ? `?${query}` : ""}`;
    const loginUrl = `/login?next=${encodeURIComponent(nextPath)}`;
    router.push(loginUrl);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      const response = await authApi.logout();

      if (response.isSuccess) {
        // Zustand 상태 업데이트
        setAuth(false);

        // 홈으로 리다이렉트
        router.push("/");
      }
    } catch (error) {
      console.error("로그아웃 실패:", error);
      alert("로그아웃에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <header className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>Header placeholder</div>

          {/* 로그인/로그아웃 버튼 */}
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:bg-gray-400"
            >
              {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
            </button>
          ) : (
            <button
              onClick={openLogin}
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              로그인
            </button>
          )}
        </div>
      </header>
    </>
  );
}
