import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  REDIRECT_AFTER_LOGIN_COOKIE,
  REDIRECT_AFTER_LOGIN_MAX_AGE_SECONDS,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/auth/cookie-constants";
import { clearAuthCookies, setAuthCookies } from "@/lib/auth/cookies";

// 공개 라우트 (인증 불필요)
const PUBLIC_ROUTES = ["/", "/login"];

// 토큰 갱신 임계값 (5분)
const REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

// 토큰 갱신 API 타임아웃 (10초)
const REFRESH_TIMEOUT_MS = 10000;

interface RefreshTokenPair {
  accessToken: string;
  refreshToken: string;
}

interface RefreshResponseBody {
  result: RefreshTokenPair;
}

interface TryRefreshTokenOptions {
  allowPassThroughOnFailure?: boolean;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // API 관련 경로는 패스
  if (pathname.startsWith("/api") || pathname.startsWith("/.well-known")) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  // 공개 라우트에서는 세션 복구가 가능한 경우에만 소프트하게 갱신 시도
  if (isPublicRoute) {
    if (!refreshToken) {
      return NextResponse.next();
    }

    if (!accessToken || isTokenExpiringSoon(accessToken)) {
      return await tryRefreshToken(request, refreshToken, { allowPassThroughOnFailure: true });
    }

    return NextResponse.next();
  }

  // 토큰 없으면 로그인 라우트로 리다이렉트
  if (!accessToken) {
    if (!refreshToken) {
      return redirectToLoginRoute(request, { clearAuth: true, reason: "auth_required" });
    }
    return await tryRefreshToken(request, refreshToken);
  }

  // 토큰 만료 임박 체크
  if (isTokenExpiringSoon(accessToken)) {
    if (refreshToken) {
      return await tryRefreshToken(request, refreshToken);
    }
    return redirectToLoginRoute(request, { clearAuth: true, reason: "refresh_token_missing" });
  }

  return NextResponse.next();
}

function redirectToLoginRoute(
  request: NextRequest,
  options?: {
    clearAuth?: boolean;
    reason?: string;
  }
): NextResponse {
  const loginUrl = new URL("/login", request.url);
  if (options?.reason) {
    loginUrl.searchParams.set("reason", options.reason);
  }

  const response = NextResponse.redirect(loginUrl);

  // 로그인 후 복귀할 경로 저장 (Open Redirect 방지)
  const returnPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const safeReturnPath =
    returnPath.startsWith("/") && !returnPath.startsWith("//") ? returnPath : "/";

  response.cookies.set(REDIRECT_AFTER_LOGIN_COOKIE, safeReturnPath, {
    path: "/",
    maxAge: REDIRECT_AFTER_LOGIN_MAX_AGE_SECONDS,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  if (options?.clearAuth) {
    clearAuthCookies(response.cookies);
  }

  return response;
}

/**
 * JWT 토큰 만료 임박 여부 확인
 * 주의: Base64 디코딩만 수행하며 서명 검증은 백엔드에서 수행됨
 */
function isTokenExpiringSoon(token: string): boolean {
  try {
    // JWT 형식 검증 (필수 버그 픽스)
    const parts = token.split(".");
    if (parts.length !== 3 || !parts[1]) {
      return true;
    }

    const payload = JSON.parse(atob(parts[1]));

    // payload.exp 검증 (필수 버그 픽스)
    if (!payload?.exp || typeof payload.exp !== "number") {
      return true;
    }

    const expiresAt = payload.exp * 1000;
    return expiresAt - Date.now() < REFRESH_THRESHOLD_MS;
  } catch {
    return true;
  }
}

/**
 * 백엔드에 토큰 갱신 요청
 */
async function tryRefreshToken(
  request: NextRequest,
  refreshToken: string,
  options?: TryRefreshTokenOptions
): Promise<NextResponse> {
  const allowPassThroughOnFailure = options?.allowPassThroughOnFailure ?? false;

  try {
    const backendUrl = process.env.BACKEND_API_BASE;

    if (!backendUrl) {
      console.error("Proxy: BACKEND_API_BASE is not configured");
      if (allowPassThroughOnFailure) {
        return NextResponse.next();
      }
      return redirectToLoginRoute(request, { clearAuth: true, reason: "config_error" });
    }

    // fetch 타임아웃 설정 (필수 버그 픽스)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REFRESH_TIMEOUT_MS);

    let reissueResponse: Response;
    try {
      reissueResponse = await fetch(`${backendUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `${REFRESH_TOKEN_COOKIE}=${refreshToken}`,
        },
        credentials: "include",
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!reissueResponse.ok) {
      console.error("Proxy: Token refresh failed:", reissueResponse.status);
      if (allowPassThroughOnFailure) {
        const response = NextResponse.next();
        if (reissueResponse.status === 401 || reissueResponse.status === 403) {
          clearAuthCookies(response.cookies);
        }
        return response;
      }
      return redirectToLoginRoute(request, { clearAuth: true, reason: "session_expired" });
    }

    const data: unknown = await reissueResponse.json();

    // API 응답 검증 (필수 버그 픽스)
    if (
      !data ||
      typeof data !== "object" ||
      !("result" in data) ||
      !data.result ||
      typeof data.result !== "object" ||
      !("accessToken" in data.result) ||
      !("refreshToken" in data.result)
    ) {
      console.error("Proxy: Invalid refresh response format");
      if (allowPassThroughOnFailure) {
        return NextResponse.next();
      }
      return redirectToLoginRoute(request, { clearAuth: true, reason: "invalid_response" });
    }

    const response = NextResponse.next();
    const payload = data as RefreshResponseBody;
    setAuthCookies(response.cookies, {
      accessToken: payload.result.accessToken,
      refreshToken: payload.result.refreshToken,
    });

    if (process.env.NODE_ENV !== "production") {
      console.warn("Proxy: Token refresh succeeded", {
        status: reissueResponse.status,
        path: request.nextUrl.pathname,
      });
    }

    return response;
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === "AbortError";
    console.error(`Proxy: Token refresh ${isTimeout ? "timeout" : "network error"}`, error);

    if (allowPassThroughOnFailure) {
      return NextResponse.next();
    }
    return redirectToLoginRoute(request, { clearAuth: true, reason: "network_error" });
  }
}

// Matcher: 불필요한 요청 제외 (정적 파일, 이미지, prefetch 등)
export const config = {
  matcher: [
    {
      source:
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
