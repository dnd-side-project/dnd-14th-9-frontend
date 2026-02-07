"use client";

import { LoginModal } from "@/components/LoginModal/LoginModal";
import {
  REDIRECT_AFTER_LOGIN_COOKIE,
  REDIRECT_AFTER_LOGIN_MAX_AGE_SECONDS,
} from "@/lib/auth/cookie-constants";
import { setCookie } from "@/lib/auth/client-cookies";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

type LoginProvider = "google" | "kakao";

type LoginRouteVariant = "modal" | "page";

interface LoginRouteClientProps {
  variant: LoginRouteVariant;
}

const REASON_MESSAGES: Record<string, string> = {
  auth_required: "로그인이 필요합니다.",
  refresh_token_missing: "세션이 만료되었습니다. 다시 로그인해 주세요.",
  session_expired: "세션이 만료되었습니다. 다시 로그인해 주세요.",
  network_error: "네트워크 오류가 발생했습니다. 다시 시도해 주세요.",
  config_error: "로그인 설정 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
  no_token: "로그인 처리가 완료되지 않았습니다. 다시 시도해 주세요.",
  access_denied: "로그인이 취소되었습니다.",
};

function normalizeInternalPath(path: string | null | undefined): string {
  if (!path) return "/";
  if (!path.startsWith("/") || path.startsWith("//")) return "/";
  if (path === "/login" || path.startsWith("/login?")) return "/";
  return path;
}

export function LoginRouteClient({ variant }: LoginRouteClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const safeNextPath = useMemo(
    () => normalizeInternalPath(searchParams.get("next")),
    [searchParams]
  );

  const reason = searchParams.get("reason");
  const reasonMessage = reason ? (REASON_MESSAGES[reason] ?? null) : null;

  const handleLogin = (provider: LoginProvider) => {
    setCookie(REDIRECT_AFTER_LOGIN_COOKIE, safeNextPath, REDIRECT_AFTER_LOGIN_MAX_AGE_SECONDS);
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_ORIGIN}/oauth2/authorization/${provider}`;
  };

  const handleClose = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.replace(safeNextPath);
  };

  if (variant === "modal") {
    return (
      <LoginModal isOpen={true} onClose={handleClose} onLogin={handleLogin} from={safeNextPath} />
    );
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4">
      <section className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-xl font-bold">로그인</h1>
        {reasonMessage ? <p className="mb-4 text-sm text-red-600">{reasonMessage}</p> : null}

        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleLogin("google")}
            className="w-full rounded border border-gray-300 bg-white px-4 py-3 text-center hover:bg-gray-50"
          >
            구글로 로그인
          </button>
          <button
            onClick={() => handleLogin("kakao")}
            className="w-full rounded bg-yellow-400 px-4 py-3 text-center hover:bg-yellow-500"
          >
            카카오로 로그인
          </button>
        </div>
      </section>
    </main>
  );
}
