import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { clearAuthCookies, setAuthCookies } from "@/lib/auth/auth-cookies";
import { buildLoginRedirectUrl, setRedirectAfterLoginCookie } from "@/lib/auth/auth-route-utils";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth/cookie-constants";
import {
  buildRefreshCookieHeader,
  mergeCookieHeaderWithAuthTokens,
} from "@/lib/auth/cookie-header-utils";
import { getErrorCodeFromResponse, parseRefreshTokenPair } from "@/lib/auth/token-refresh-utils";
import { BACKEND_ERROR_CODES, LOGIN_INTERNAL_ERROR_CODES } from "@/lib/error/error-codes";

// 공개 페이지 라우트 (인증 불필요)
const PUBLIC_PAGE_ROUTES = [/^\/$/, /^\/login$/, /^\/session\/\d+$/];

// 공개 API 라우트 (인증 불필요)
const PUBLIC_API_ROUTE_PATTERNS = [
  /^\/api\/auth\/login$/,
  /^\/api\/auth\/callback(?:\/[^/]+)?$/,
  /^\/api\/sessions$/,
  /^\/api\/sessions\/\d+$/,
];

// 토큰 갱신 임계값 (5분)
const REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

// 토큰 갱신 API 타임아웃 (10초)
const REFRESH_TIMEOUT_MS = 10000;
// 공개 페이지에서 사용하는 소프트 갱신 타임아웃 (짧게 제한)
const SOFT_REFRESH_TIMEOUT_MS = 1500;

interface TryRefreshTokenOptions {
  allowPassThroughOnFailure?: boolean;
  timeoutMs?: number;
}

interface AuthFailureResponseOptions {
  clearAuth?: boolean;
  reason?: string;
  status?: number;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicPageRoute = PUBLIC_PAGE_ROUTES.some((pattern) => pattern.test(pathname));

  // well-known 경로는 인증 처리 없이 통과한다.
  if (pathname.startsWith("/.well-known")) {
    return NextResponse.next();
  }

  // 공개 API 예외 경로는 인증 처리 없이 통과한다.
  if (isPublicApiRoute(pathname)) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  // 공개 페이지 라우트에서는 세션 복구가 가능한 경우에만 소프트하게 갱신 시도
  if (isPublicPageRoute) {
    if (!refreshToken) {
      return NextResponse.next();
    }

    if (!accessToken || isTokenExpiringSoon(accessToken)) {
      return await tryRefreshToken(request, refreshToken, {
        allowPassThroughOnFailure: true,
        timeoutMs: SOFT_REFRESH_TIMEOUT_MS,
      });
    }

    return NextResponse.next();
  }

  // 토큰 없으면 로그인 라우트로 리다이렉트
  if (!accessToken) {
    if (!refreshToken) {
      return buildAuthFailureResponse(request, {
        clearAuth: true,
        reason: LOGIN_INTERNAL_ERROR_CODES.AUTH_REQUIRED,
        status: 401,
      });
    }
    return await tryRefreshToken(request, refreshToken);
  }

  // 토큰 만료 임박 체크
  if (isTokenExpiringSoon(accessToken)) {
    if (refreshToken) {
      return await tryRefreshToken(request, refreshToken);
    }
    return buildAuthFailureResponse(request, {
      clearAuth: true,
      reason: LOGIN_INTERNAL_ERROR_CODES.AUTH_REQUIRED,
      status: 401,
    });
  }

  return NextResponse.next();
}

function buildAuthFailureResponse(
  request: NextRequest,
  options?: AuthFailureResponseOptions
): NextResponse {
  const reason = options?.reason ?? LOGIN_INTERNAL_ERROR_CODES.AUTH_REQUIRED;

  if (isApiRoute(request.nextUrl.pathname)) {
    const response = NextResponse.json(
      {
        isSuccess: false,
        code: reason,
        result: null,
        message: "인증이 필요합니다.",
      },
      { status: options?.status ?? 401 }
    );

    if (options?.clearAuth) {
      clearAuthCookies(response.cookies);
    }

    return response;
  }

  return redirectToLoginRoute(request, options);
}

function redirectToLoginRoute(
  request: NextRequest,
  options?: {
    clearAuth?: boolean;
    reason?: string;
  }
): NextResponse {
  const loginUrl = options?.reason
    ? buildLoginRedirectUrl(request, options.reason)
    : new URL("/login", request.url);
  const response = NextResponse.redirect(loginUrl);
  if (shouldPersistRedirectAfterLogin(request.nextUrl.pathname)) {
    setRedirectAfterLoginCookie(response, `${request.nextUrl.pathname}${request.nextUrl.search}`);
  }

  if (options?.clearAuth) {
    clearAuthCookies(response.cookies);
  }

  return response;
}

function isPublicApiRoute(pathname: string): boolean {
  return PUBLIC_API_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname));
}

function isApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/");
}

function shouldPersistRedirectAfterLogin(pathname: string): boolean {
  return !isApiRoute(pathname);
}

/**
 * JWT payload는 base64url 인코딩(-, _)과 padding 생략을 사용한다.
 * atob 디코딩 전 표준 base64(+ , /) 및 padding으로 정규화한다.
 */
function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const paddingLength = (4 - (normalized.length % 4)) % 4;
  return atob(normalized + "=".repeat(paddingLength));
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

    const payload = JSON.parse(decodeBase64Url(parts[1]));

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
  const refreshTimeoutMs = options?.timeoutMs ?? REFRESH_TIMEOUT_MS;

  try {
    const backendUrl = process.env.BACKEND_API_BASE;

    if (!backendUrl) {
      console.error("Proxy: BACKEND_API_BASE is not configured");
      if (allowPassThroughOnFailure) {
        return NextResponse.next();
      }
      return buildAuthFailureResponse(request, {
        clearAuth: true,
        reason: LOGIN_INTERNAL_ERROR_CODES.CONFIG_ERROR,
        status: 500,
      });
    }

    // fetch 타임아웃 설정 (필수 버그 픽스)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), refreshTimeoutMs);

    let reissueResponse: Response;
    try {
      reissueResponse = await fetch(`${backendUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: buildRefreshCookieHeader(refreshToken),
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

      const errorCode = await getErrorCodeFromResponse(reissueResponse);
      const status =
        reissueResponse.status === 401 || reissueResponse.status === 403
          ? 401
          : reissueResponse.status >= 500
            ? 500
            : 400;
      return buildAuthFailureResponse(request, {
        clearAuth: true,
        reason: errorCode ?? BACKEND_ERROR_CODES.COMMON_INTERNAL_SERVER_ERROR,
        status,
      });
    }

    const data: unknown = await reissueResponse.json();
    const tokens = parseRefreshTokenPair(data);

    // API 응답 검증 (필수 버그 픽스)
    if (!tokens) {
      console.error("Proxy: Invalid refresh response format");
      if (allowPassThroughOnFailure) {
        return NextResponse.next();
      }
      return buildAuthFailureResponse(request, {
        clearAuth: true,
        reason: BACKEND_ERROR_CODES.COMMON_INTERNAL_SERVER_ERROR,
        status: 500,
      });
    }

    // 현재 요청의 쿠키 헤더를 갱신해서 다운스트림(RSC, Route Handler)에 새 토큰을 전달한다.
    const requestHeaders = new Headers(request.headers);
    const updatedCookieHeader = mergeCookieHeaderWithAuthTokens(
      request.headers.get("cookie"),
      tokens
    );
    if (updatedCookieHeader) {
      requestHeaders.set("cookie", updatedCookieHeader);
    }

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });
    setAuthCookies(response.cookies, {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
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
    return buildAuthFailureResponse(request, {
      clearAuth: true,
      reason: LOGIN_INTERNAL_ERROR_CODES.NETWORK_ERROR,
      status: isTimeout ? 504 : 500,
    });
  }
}

// Matcher: 불필요한 요청 제외 (정적 파일, 이미지, prefetch 등)
// 공개 API 예외 처리는 matcher가 아닌 proxy 본문에서 수행한다.
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
