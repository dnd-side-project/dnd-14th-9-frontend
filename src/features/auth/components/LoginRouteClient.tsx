"use client";

import { LoginModal } from "@/features/auth/components/LoginModal";
import { normalizeInternalPath } from "@/lib/auth/login-flow";
import { REDIRECT_AFTER_LOGIN_COOKIE } from "@/lib/auth/cookie-constants";
import { getCookie } from "@/lib/auth/client-cookies";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

export function LoginRouteClient() {
  const router = useRouter();

  const safeNextPath = useMemo(
    () => normalizeInternalPath(getCookie(REDIRECT_AFTER_LOGIN_COOKIE)),
    []
  );

  const handleClose = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.replace(safeNextPath);
  };

  return <LoginModal isOpen={true} onClose={handleClose} nextPath={safeNextPath} />;
}
