import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  LOGIN_ERROR_COOKIE,
  LOGIN_REQUIRED_COOKIE,
  REDIRECT_AFTER_LOGIN_COOKIE,
  REDIRECT_AFTER_LOGIN_MAX_AGE_SECONDS,
} from "@/lib/auth/cookie-constants";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`))
    ?.split("=")[1];

  if (!cookie) return null;

  try {
    return decodeURIComponent(cookie);
  } catch {
    return cookie;
  }
}

function setCookie(name: string, value: string, maxAge: number) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
}

function clearCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
}

function normalizeInternalPath(path: string | null | undefined): string {
  if (!path) return "/";
  if (!path.startsWith("/") || path.startsWith("//")) return "/";
  return path;
}

interface LoginSignalState {
  shouldOpen: boolean;
  from: string;
  error: string | null;
  key: string;
}

function readLoginSignal(pathname: string | null): LoginSignalState {
  const shouldOpen = getCookie(LOGIN_REQUIRED_COOKIE) === "1";
  const from = normalizeInternalPath(getCookie(REDIRECT_AFTER_LOGIN_COOKIE) ?? pathname ?? "/");
  const error = getCookie(LOGIN_ERROR_COOKIE);
  return {
    shouldOpen,
    from,
    error,
    key: `${from}|${error ?? ""}`,
  };
}

/**
 * 로그인 모달 상태 및 OAuth 로직을 관리하는 훅
 */
export function useLoginModal() {
  const pathname = usePathname();

  const [manualFrom, setManualFrom] = useState<string | null>(null);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [dismissedSignalKey, setDismissedSignalKey] = useState<string | null>(null);

  const signalState = useMemo(() => readLoginSignal(pathname), [pathname]);

  const isSignalOpen = signalState.shouldOpen && dismissedSignalKey !== signalState.key;

  useEffect(() => {
    if (!signalState.shouldOpen) return;
    clearCookie(LOGIN_REQUIRED_COOKIE);
    clearCookie(LOGIN_ERROR_COOKIE);
  }, [signalState.shouldOpen]);

  const openModal = () => {
    setManualFrom(normalizeInternalPath(pathname));
    setIsManualOpen(true);
  };

  const closeModal = () => {
    setIsManualOpen(false);
    setDismissedSignalKey(signalState.key);
    clearCookie(LOGIN_REQUIRED_COOKIE);
    clearCookie(LOGIN_ERROR_COOKIE);
  };

  const handleLogin = (provider: "google" | "kakao") => {
    // 리다이렉트 경로를 쿠키에 저장
    setCookie(
      REDIRECT_AFTER_LOGIN_COOKIE,
      normalizeInternalPath((isSignalOpen ? signalState.from : manualFrom) ?? pathname),
      REDIRECT_AFTER_LOGIN_MAX_AGE_SECONDS
    );

    // OAuth 시작
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_ORIGIN}/oauth2/authorization/${provider}`;
  };

  const isOpen = isManualOpen || isSignalOpen;
  const from = isOpen ? (isSignalOpen ? signalState.from : manualFrom) : null;
  const error = isSignalOpen ? signalState.error : null;

  return {
    isOpen,
    openModal,
    closeModal,
    handleLogin,
    from,
    error,
  };
}
