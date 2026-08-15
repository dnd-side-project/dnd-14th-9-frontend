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

/**
 * 실제 페이지나 API가 실행되기 전에 인증 상태를 확인하는 공통 진입점이다.
 *
 * 공개 경로인지 보호 경로인지 구분하고 Access Token 상태에 따라 요청을 그대로 통과시키거나,
 * 기존 Refresh 작업에만 합류하는 soft 갱신 또는 새 작업을 만들 수 있는 hard 갱신을 선택한다.
 * 각 갱신 결과는 현재 요청만을 위한 응답과 Cookie로 변환한다.
 *
 * @param request 브라우저 또는 API client가 보낸 현재 Next.js 요청.
 * @returns 인증 상태에 따라 통과, 새 Cookie, redirect 또는 API 오류가 적용된 응답.
 */
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

/**
 * Refresh 실패 원인을 토큰 같은 민감정보 없이 정해진 필드만 사용해 기록한다.
 * soft 실패는 현재 Access Token으로 계속 진행할 수 있어 warn으로 남기고,
 * hard 실패는 인증이 필요한 요청을 완료하지 못한 상황이므로 error로 남긴다.
 *
 * @param request 실패가 발생한 현재 요청. 경로 종류를 구하는 데만 사용한다.
 * @param details 실패 종류, 상태 코드, Cookie 삭제 여부와 갱신 모드.
 */
function logRefreshFailure(
  request: NextRequest,
  details: {
    reason: RefreshFailureReason;
    status: number;
    cookieClear: boolean;
    mode: RefreshMode;
  }
) {
  const context = {
    reason: details.reason,
    status: details.status,
    routeType: getRouteType(request.nextUrl.pathname),
    cookieClear: details.cookieClear,
    mode: details.mode,
  };

  if (details.mode === "soft") {
    console.warn("Proxy: Token refresh failed", context);
    return;
  }

  console.error("Proxy: Token refresh failed", context);
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

/**
 * 공유된 Refresh 성공 결과를 현재 caller만의 NextResponse로 변환한다.
 *
 * 갱신된 토큰을 현재 요청의 Cookie header에 넣어 뒤의 route handler가 바로 사용할 수 있게 하고,
 * 응답 Cookie에도 넣어 브라우저가 다음 요청부터 새 토큰을 보내도록 한다. Refresh 결과만 공유하고
 * 응답 객체는 요청마다 새로 만들기 때문에 동시에 들어온 caller들의 응답이 서로 섞이지 않는다.
 *
 * @param request 새 토큰을 전달받아야 하는 현재 요청.
 * @param outcome 백엔드가 반환한 새 Access Token과 Refresh Token.
 * @param mode 결과를 받은 경로가 soft인지 hard인지 나타내는 값.
 * @returns 새 토큰이 요청 header와 응답 Cookie에 적용된 응답.
 */
function buildRefreshSuccessResponse(
  request: NextRequest,
  outcome: Extract<RefreshOutcome, { kind: "success" }>,
  mode: RefreshMode
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
    });
  }

  return response;
}

/**
 * hard 갱신 실패를 보호 페이지의 로그인 이동 또는 보호 API의 JSON 오류 응답으로 바꾼다.
 * hard 요청은 유효한 Access Token 없이 진행할 수 없으므로 인증 Cookie도 함께 삭제한다.
 *
 * @param request 페이지 요청인지 API 요청인지 판단할 현재 요청.
 * @param outcome 백엔드 HTTP 오류, 잘못된 응답, timeout 또는 network 오류 정보.
 * @returns 요청 종류와 실패 원인에 맞는 인증 실패 응답.
 */
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

/**
 * coordinator가 돌려준 Refresh 결과와 갱신 모드에 맞는 최종 응답을 선택한다.
 * 성공이면 두 모드 모두 새 토큰을 전달한다. 실패이면 로그를 남긴 뒤 soft 요청은 기존 토큰으로
 * 계속 진행시키고, hard 요청은 로그인 이동 또는 API 오류 응답으로 변환한다.
 *
 * @param request 최종 응답을 받아야 하는 현재 요청.
 * @param outcome coordinator가 정리한 성공 또는 실패 결과.
 * @param mode 실패했을 때 통과할지 차단할지를 결정하는 soft 또는 hard 모드.
 * @returns 현재 caller에게 전달할 NextResponse.
 */
function buildResponseFromRefreshOutcome(
  request: NextRequest,
  outcome: RefreshOutcome,
  mode: RefreshMode
): NextResponse {
  if (outcome.kind === "success") {
    return buildRefreshSuccessResponse(request, outcome, mode);
  }

  logRefreshFailure(request, {
    reason: outcome.reason,
    status: outcome.status,
    cookieClear: mode === "hard",
    mode,
  });

  if (mode === "soft") {
    return NextResponse.next();
  }

  return buildHardRefreshFailureResponse(request, outcome);
}

/**
 * 새 Refresh를 시작하지 않고 같은 Refresh Token의 기존 작업에만 합류한다.
 * 작업이 없거나 대기 시간이 지나 null을 받으면 현재 요청을 그대로 통과시킨다.
 * 결과를 받았을 때만 성공 Cookie 또는 soft 실패 정책을 현재 응답에 적용한다.
 *
 * @param request 기존 Access Token으로 계속 진행할 수 있는 현재 요청.
 * @param refreshToken 기존 Refresh 작업을 찾을 때 사용할 Refresh Token.
 * @returns 그대로 통과하거나 기존 Refresh 결과가 적용된 응답.
 */
async function trySoftRefreshToken(
  request: NextRequest,
  refreshToken: string
): Promise<NextResponse> {
  const outcome = await joinSoftRefreshSingleFlight(refreshToken);
  if (!outcome) {
    return NextResponse.next();
  }

  return buildResponseFromRefreshOutcome(request, outcome, "soft");
}

/**
 * 유효한 Access Token이 없어 반드시 갱신 결과가 필요한 요청을 처리한다.
 * 백엔드 주소가 없으면 설정 오류 응답을 만들고, 주소가 있으면 같은 Refresh Token의 hard 작업을
 * 공유하거나 새로 시작한 뒤 그 결과를 현재 요청의 성공 또는 실패 응답으로 변환한다.
 *
 * @param request 새 Access Token이 있어야 계속 진행할 수 있는 현재 요청.
 * @param refreshToken 기존 작업을 찾거나 새 백엔드 갱신에 사용할 Refresh Token.
 * @returns Refresh 성공 또는 hard 실패 정책이 적용된 응답.
 */
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

  const outcome = await runHardRefreshSingleFlight(refreshToken, backendUrl);
  return buildResponseFromRefreshOutcome(request, outcome, "hard");
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
