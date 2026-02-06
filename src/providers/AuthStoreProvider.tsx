"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/authStore";

interface AuthStoreProviderProps {
  children: React.ReactNode;
  initialAuth: boolean;
}

/**
 * AuthStoreProvider
 * - RSC에서 받은 초기 인증 상태를 Zustand store에 설정
 * - 깜빡임 없이 초기 렌더링부터 올바른 인증 상태 반영
 */
export function AuthStoreProvider({ children, initialAuth }: AuthStoreProviderProps) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      useAuthStore.setState({ isAuthenticated: initialAuth });
      initialized.current = true;
    }
  }, [initialAuth]);

  return <>{children}</>;
}
