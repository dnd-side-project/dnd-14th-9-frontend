"use client";

import { useRef } from "react";
import { useAuthStore } from "@/stores/authStore";

interface AuthStoreProviderProps {
  children: React.ReactNode;
  initialAuth: boolean;
}

/**
 * AuthStoreProvider
 * - RSC에서 받은 초기 인증 상태를 Zustand store에 설정
 * - 렌더 중에 동기적으로 초기화하여 깜빡임 방지
 * - useEffect가 아닌 render phase에서 실행되어 첫 렌더부터 올바른 상태 반영
 */
export function AuthStoreProvider({ children, initialAuth }: AuthStoreProviderProps) {
  const initialized = useRef(false);

  // ✅ useEffect 대신 렌더 중에 동기적으로 초기화
  // - 첫 렌더 전에 실행되어 깜빡임 없음
  // - useEffect는 렌더 후 실행되어 깜빡임 발생
  if (!initialized.current) {
    useAuthStore.setState({ isAuthenticated: initialAuth });
    initialized.current = true;
  }

  return <>{children}</>;
}
