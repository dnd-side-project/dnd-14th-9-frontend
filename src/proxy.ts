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
// TEMP: 로그인 복귀 동작 수동 확인을 위한 테스트 페이지
const PUBLIC_ROUTES = ["/", "/login", "/redirect-test"];

// 토큰 갱신 임계값 (5분)
const REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

interface RefreshTokenPair {
  accessToken: string;
  refreshToken: string;
}

interface RefreshResponseBody {
  result: RefreshTokenPair;
}

interface TryRefreshTokenOptions {
  // 공개 라우트에서는 갱신 실패 시 로그인으로 보내지 않고 요청을 그대로 통과시킨다.
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
    // accessToken 없고 refreshToken만 있으면 갱신 시도
    return await tryRefreshToken(request, refreshToken);
  }

  // 토큰 만료 임박 체크
  if (isTokenExpiringSoon(accessToken)) {
    if (refreshToken) {
      return await tryRefreshToken(request, refreshToken);
    }
    // refreshToken 없으면 로그인 라우트로 리다이렉트
    return redirectToLoginRoute(request, { clearAuth: true, reason: "refresh_token_missing" });
  }

  return NextResponse.next();
}

/**
 * 로그인 라우트로 리다이렉트하면서 복귀 경로/실패 원인을 전달
 */
function getSafeReturnPath(request: NextRequest): string {
  const returnPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  if (!returnPath.startsWith("/") || returnPath.startsWith("//")) {
    return "/";
  }
  return returnPath;
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
  response.cookies.set(REDIRECT_AFTER_LOGIN_COOKIE, getSafeReturnPath(request), {
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
 * JWT 토큰 만료 임박 여부 확인 (Base64 디코딩만, 서명 검증 X)
 */
function isTokenExpiringSoon(token: string): boolean {
  try {
    const [, payloadBase64] = token.split(".");
    const payload = JSON.parse(atob(payloadBase64));
    const expiresAt = payload.exp * 1000;
    return expiresAt - Date.now() < REFRESH_THRESHOLD_MS;
  } catch {
    // 디코딩 실패 시 갱신 시도
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

    const reissueResponse = await fetch(`${backendUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${REFRESH_TOKEN_COOKIE}=${refreshToken}`,
      },
      credentials: "include",
    });

    if (!reissueResponse.ok) {
      console.error("Proxy: Token refresh failed:", reissueResponse.status);
      if (allowPassThroughOnFailure) {
        const response = NextResponse.next();
        // refreshToken 자체가 무효한 상태면 인증 쿠키를 정리해 다음 요청의 분기/상태를 명확히 한다.
        if (reissueResponse.status === 401 || reissueResponse.status === 403) {
          clearAuthCookies(response.cookies);
        }
        return response;
      }
      return redirectToLoginRoute(request, { clearAuth: true, reason: "session_expired" });
    }

    const response = NextResponse.next();
    const payload = (await reissueResponse.json()) as RefreshResponseBody;
    // 재발급 응답 스키마는 고정 계약으로 가정하고 body 토큰을 바로 쿠키에 저장한다.
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
    console.error("Proxy: Token refresh error:", error);
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
