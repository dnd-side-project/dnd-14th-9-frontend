import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * 로그인 모달 상태 및 OAuth 로직을 관리하는 훅
 */
export function useLoginModal() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const from = searchParams.get("from");
  const error = searchParams.get("error");
  const showLogin = searchParams.get("showLogin") === "true";

  const [isOpen, setIsOpen] = useState(false);
  const prevShowLoginRef = useRef(showLogin);

  useEffect(() => {
    if (showLogin && !prevShowLoginRef.current) {
      // eslint-disable-next-line no-console
      console.log("Login required. From:", from, "Error:", error);
    }

    prevShowLoginRef.current = showLogin;
  }, [showLogin, from, error]);

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);

    if (!showLogin) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("showLogin");
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };

  const handleLogin = (provider: "google" | "kakao") => {
    const fromPath = from || "/";

    // 리다이렉트 경로를 쿠키에 저장
    document.cookie = `redirectAfterLogin=${encodeURIComponent(fromPath)}; path=/; max-age=300`;

    // OAuth 시작
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/oauth2/authorization/${provider}`;
  };

  return {
    isOpen: showLogin || isOpen,
    openModal,
    closeModal,
    handleLogin,
    from,
    error,
  };
}
