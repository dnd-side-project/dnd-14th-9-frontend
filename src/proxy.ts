import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { clearAuthCookies, setAuthCookies } from "@/lib/auth/auth-cookies";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth/cookie-constants";
import { mergeCookieHeaderWithAuthTokens } from "@/lib/auth/cookie-header-utils";
import { buildLoginRedirectUrl } from "@/lib/auth/login-redirect-utils";
import { setRedirectAfterLoginCookie } from "@/lib/auth/redirect-after-login-cookie";
import {
  joinSoftRefreshSingleFlight,
  runHardRefreshSingleFlight,
  type HardRefreshResult,
  type RefreshOutcome,
} from "@/lib/auth/refresh-token-single-flight";
import { isKnownPublicPageRoute, isProtectedPageRoute } from "@/lib/auth/route-access-policy";
import { BACKEND_ERROR_CODES, LOGIN_INTERNAL_ERROR_CODES } from "@/lib/error/error-codes";
import { LOGIN_ROUTE } from "@/lib/routes/route-paths";
import { isMockModeEnabled } from "@/mocks/is-mock-mode-enabled";

// 공개 API 라우트 (인증 불필요)
const PUBLIC_API_ROUTE_PATTERNS = [
  /^\/api\/auth\/login$/,
  /^\/api\/auth\/callback(?:\/[^/]+)?$/,
  /^\/api\/sessions$/,
  /^\/api\/sessions\/\d+$/,
];

// 토큰 갱신 임계값 (5분)
const REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

interface AuthFailureResponseOptions {
  clearAuth?: boolean;
  reason?: string;
  status?: number;
}

type RouteType = "public" | "protected" | "api";
type AccessTokenState = "valid" | "expiring" | "expired_or_invalid";
type RefreshMode = "soft" | "hard";
type RefreshFailureReason = Extract<RefreshOutcome, { kind: "failure" }>["reason"];
type RefreshDisposition = HardRefreshResult["disposition"];

let fingerprintBypassLogged = false;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicPageRoute = isKnownPublicPageRoute(pathname);
  const requiresHardAuth = isApiRoute(pathname) || isProtectedPageRoute(pathname);

  // well-known 경로는 인증 처리 없이 통과한다.
  if (pathname.startsWith("/.well-known")) {
    return NextResponse.next();
  }

  // 로컬 mock 모드에서는 MSW가 인증 API 응답을 담당하므로 proxy 인증 관문을 통과시킨다.
  if (isMockModeEnabled()) {
    return NextResponse.next();
  }

  // 공개 API 예외 경로는 인증 처리 없이 통과한다.
  if (isPublicApiRoute(pathname)) {
    return NextResponse.next();
  }

  // 보호 경로가 아니고 알려진 공개 경로도 아니면 Next.js 404 처리로 넘긴다.
  if (!isPublicPageRoute && !requiresHardAuth) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  // 공개 페이지 라우트에서는 세션 복구가 가능한 경우에만 소프트하게 갱신 시도
  if (isPublicPageRoute) {
    if (!refreshToken) {
      return NextResponse.next();
    }

    if (!accessToken || getAccessTokenState(accessToken) !== "valid") {
      return await trySoftRefreshToken(request, refreshToken);
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
    return await tryHardRefreshToken(request, refreshToken);
  }

  // 토큰 만료 상태 체크
  const accessTokenState = getAccessTokenState(accessToken);

  if (accessTokenState === "expiring") {
    if (!refreshToken) {
      return NextResponse.next();
    }

    return await trySoftRefreshToken(request, refreshToken);
  }

  if (accessTokenState === "expired_or_invalid") {
    if (refreshToken) {
      return await tryHardRefreshToken(request, refreshToken);
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
    : new URL(LOGIN_ROUTE, request.url);
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

const ROUTE_TYPE_CONFIG: Array<{
  type: Exclude<RouteType, "public">;
  check: (pathname: string) => boolean;
}> = [
  { type: "api", check: isApiRoute },
  { type: "protected", check: isProtectedPageRoute },
];

function getRouteType(pathname: string): RouteType {
  const matched = ROUTE_TYPE_CONFIG.find((route) => route.check(pathname));
  return matched?.type ?? "public";
}

function logRefreshFailure(
  request: NextRequest,
  details: {
    reason: RefreshFailureReason;
    status: number;
    cookieClear: boolean;
    mode: RefreshMode;
    disposition: RefreshDisposition;
  }
) {
  const context = {
    reason: details.reason,
    status: details.status,
    routeType: getRouteType(request.nextUrl.pathname),
    cookieClear: details.cookieClear,
    mode: details.mode,
    disposition: details.disposition,
  };

  console.error("Proxy: Token refresh failed", context);
}

function logFingerprintBypassOnce() {
  if (fingerprintBypassLogged) {
    return;
  }

  fingerprintBypassLogged = true;
  console.warn("Proxy: Token refresh fingerprint bypass", {
    mode: "hard",
  });
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
 * JWT 토큰 만료 상태 확인
 * 주의: Base64 디코딩만 수행하며 서명 검증은 백엔드에서 수행됨
 */
function getAccessTokenState(token: string): AccessTokenState {
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || !parts[1]) {
      return "expired_or_invalid";
    }

    const payload = JSON.parse(decodeBase64Url(parts[1]));
    if (typeof payload?.exp !== "number") {
      return "expired_or_invalid";
    }

    const remainingMs = payload.exp * 1000 - Date.now();
    if (remainingMs <= 0) {
      return "expired_or_invalid";
    }

    return remainingMs < REFRESH_THRESHOLD_MS ? "expiring" : "valid";
  } catch {
    return "expired_or_invalid";
  }
}

function buildRefreshSuccessResponse(
  request: NextRequest,
  outcome: Extract<RefreshOutcome, { kind: "success" }>,
  mode: RefreshMode,
  disposition: RefreshDisposition
): NextResponse {
  const tokens = {
    accessToken: outcome.tokens.accessToken,
    refreshToken: outcome.tokens.refreshToken,
  };
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
  setAuthCookies(response.cookies, tokens);

  if (process.env.NODE_ENV !== "production") {
    console.warn("Proxy: Token refresh succeeded", {
      status: outcome.status,
      routeType: getRouteType(request.nextUrl.pathname),
      mode,
      disposition,
    });
  }

  return response;
}

function buildHardRefreshFailureResponse(
  request: NextRequest,
  outcome: Extract<RefreshOutcome, { kind: "failure" }>
): NextResponse {
  if (outcome.reason === "http_error") {
    const status =
      outcome.status === 401 || outcome.status === 403 ? 401 : outcome.status >= 500 ? 500 : 400;
    return buildAuthFailureResponse(request, {
      clearAuth: true,
      reason: outcome.errorCode ?? BACKEND_ERROR_CODES.COMMON_INTERNAL_SERVER_ERROR,
      status,
    });
  }

  if (outcome.reason === "invalid_response") {
    return buildAuthFailureResponse(request, {
      clearAuth: true,
      reason: BACKEND_ERROR_CODES.COMMON_INTERNAL_SERVER_ERROR,
      status: 500,
    });
  }

  return buildAuthFailureResponse(request, {
    clearAuth: true,
    reason: LOGIN_INTERNAL_ERROR_CODES.NETWORK_ERROR,
    status: outcome.status,
  });
}

function buildResponseFromRefreshOutcome(
  request: NextRequest,
  outcome: RefreshOutcome,
  mode: RefreshMode,
  disposition: RefreshDisposition
): NextResponse {
  if (outcome.kind === "success") {
    return buildRefreshSuccessResponse(request, outcome, mode, disposition);
  }

  logRefreshFailure(request, {
    reason: outcome.reason,
    status: outcome.status,
    cookieClear: mode === "hard",
    mode,
    disposition,
  });

  if (mode === "soft") {
    return NextResponse.next();
  }

  return buildHardRefreshFailureResponse(request, outcome);
}

async function trySoftRefreshToken(
  request: NextRequest,
  refreshToken: string
): Promise<NextResponse> {
  const result = await joinSoftRefreshSingleFlight(refreshToken);
  if (result.kind === "miss" || result.kind === "caller_timeout") {
    return NextResponse.next();
  }

  return buildResponseFromRefreshOutcome(request, result.outcome, "soft", result.disposition);
}

async function tryHardRefreshToken(
  request: NextRequest,
  refreshToken: string
): Promise<NextResponse> {
  const backendUrl = process.env.BACKEND_API_BASE;
  if (!backendUrl) {
    console.error("Proxy: BACKEND_API_BASE is not configured");
    return buildAuthFailureResponse(request, {
      clearAuth: true,
      reason: LOGIN_INTERNAL_ERROR_CODES.CONFIG_ERROR,
      status: 500,
    });
  }

  const result = await runHardRefreshSingleFlight(refreshToken, backendUrl);
  if (result.disposition === "bypass") {
    logFingerprintBypassOnce();
  }

  return buildResponseFromRefreshOutcome(request, result.outcome, "hard", result.disposition);
}

// Matcher: 불필요한 요청 제외 (정적 파일, 이미지, prefetch 등)
// 공개 API 예외 처리는 matcher가 아닌 proxy 본문에서 수행한다.
export const config = {
  matcher: [
    {
      source:
        "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
