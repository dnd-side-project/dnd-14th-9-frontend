import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  LOGIN_ERROR_COOKIE,
  LOGIN_REQUIRED_COOKIE,
  REDIRECT_AFTER_LOGIN_COOKIE,
  REDIRECT_AFTER_LOGIN_MAX_AGE_SECONDS,
} from "@/lib/auth/cookies";

function getCookie(name: string): string | null {
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
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
}

function normalizeInternalPath(path: string | null | undefined): string {
  if (!path) return "/";
  if (!path.startsWith("/") || path.startsWith("//")) return "/";
  return path;
}

/**
 * 로그인 모달 상태 및 OAuth 로직을 관리하는 훅
 */
export function useLoginModal() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // TODO(auth): proxy/callback의 쿼리 의존 제거가 완료되면 fallback 분기를 정리한다.
  const queryFrom = searchParams.get("from");
  const queryError = searchParams.get("error");
  const queryShowLogin = searchParams.get("showLogin") === "true";

  const [manualFrom, setManualFrom] = useState<string | null>(null);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const prevModalSignalRef = useRef(false);

  const modalSignal = useMemo(() => {
    const shouldOpenByCookie = getCookie(LOGIN_REQUIRED_COOKIE) === "1";
    const shouldOpenByQuery = queryShowLogin;
    const shouldOpen = shouldOpenByCookie || shouldOpenByQuery;
    const cookieFrom = getCookie(REDIRECT_AFTER_LOGIN_COOKIE);
    const cookieError = getCookie(LOGIN_ERROR_COOKIE);

    return {
      shouldOpen,
      from: normalizeInternalPath(cookieFrom ?? queryFrom ?? pathname ?? "/"),
      error: cookieError ?? queryError,
    };
  }, [pathname, queryShowLogin, queryFrom, queryError]);

  useEffect(() => {
    if (modalSignal.shouldOpen && !prevModalSignalRef.current) {
      // eslint-disable-next-line no-console
      console.log("Login required. From:", modalSignal.from, "Error:", modalSignal.error);
    }

    clearCookie(LOGIN_REQUIRED_COOKIE);
    clearCookie(LOGIN_ERROR_COOKIE);
    prevModalSignalRef.current = modalSignal.shouldOpen;
  }, [modalSignal]);

  const openModal = () => {
    setManualFrom(normalizeInternalPath(pathname));
    setIsManualOpen(true);
  };

  const closeModal = () => {
    setIsManualOpen(false);

    if (!queryShowLogin) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("showLogin");
    params.delete("from");
    params.delete("error");
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };

  const handleLogin = (provider: "google" | "kakao") => {
    // 리다이렉트 경로를 쿠키에 저장
    setCookie(
      REDIRECT_AFTER_LOGIN_COOKIE,
      normalizeInternalPath((modalSignal.shouldOpen ? modalSignal.from : manualFrom) ?? pathname),
      REDIRECT_AFTER_LOGIN_MAX_AGE_SECONDS
    );

    // OAuth 시작
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_ORIGIN}/oauth2/authorization/${provider}`;
  };

  const isOpen = isManualOpen || modalSignal.shouldOpen;
  const from = isOpen ? (modalSignal.shouldOpen ? modalSignal.from : manualFrom) : null;
  const error = modalSignal.shouldOpen ? modalSignal.error : null;

  return {
    isOpen,
    openModal,
    closeModal,
    handleLogin,
    from,
    error,
  };
}
