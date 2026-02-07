import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { clearAuthCookies, setAuthCookies, setLoginSignalCookies } from "@/lib/auth/cookies";

// 공개 라우트 (인증 불필요)
const PUBLIC_ROUTES = ["/"];

// 토큰 갱신 임계값 (5분)
const REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

interface RefreshTokenPair {
  accessToken: string;
  refreshToken: string;
}

interface RefreshResponseBody {
  result: RefreshTokenPair;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 공개 라우트 또는 인증 관련 경로는 패스
  if (
    PUBLIC_ROUTES.includes(pathname) ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/.well-known")
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // 토큰 없으면 홈으로 리다이렉트 + 로그인 모달 표시
  if (!accessToken) {
    if (!refreshToken) {
      return redirectToLoginModal(request, { clearAuth: true, error: "auth_required" });
    }
    // accessToken 없고 refreshToken만 있으면 갱신 시도
    return await tryRefreshToken(request, refreshToken);
  }

  // 토큰 만료 임박 체크
  if (isTokenExpiringSoon(accessToken)) {
    if (refreshToken) {
      return await tryRefreshToken(request, refreshToken);
    }
    // refreshToken 없으면 홈으로 리다이렉트 + 로그인 모달 표시
    return redirectToLoginModal(request, { clearAuth: true, error: "refresh_token_missing" });
  }

  return NextResponse.next();
}

/**
 * 홈으로 리다이렉트하면서 로그인 모달 표시 파라미터 추가
 */
function getSafeReturnPath(request: NextRequest): string {
  const returnPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  if (!returnPath.startsWith("/") || returnPath.startsWith("//")) {
    return "/";
  }
  return returnPath;
}

function redirectToLoginModal(
  request: NextRequest,
  options?: {
    clearAuth?: boolean;
    error?: string;
  }
): NextResponse {
  const response = NextResponse.redirect(new URL("/", request.url));
  setLoginSignalCookies(response.cookies, {
    error: options?.error,
    redirectPath: getSafeReturnPath(request),
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
async function tryRefreshToken(request: NextRequest, refreshToken: string): Promise<NextResponse> {
  try {
    const backendUrl = process.env.BACKEND_API_BASE;

    if (!backendUrl) {
      console.error("Proxy: BACKEND_API_BASE is not configured");
      return redirectToLoginModal(request, { clearAuth: true, error: "config_error" });
    }

    const reissueResponse = await fetch(`${backendUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refreshToken=${refreshToken}`,
      },
      credentials: "include",
    });

    if (!reissueResponse.ok) {
      console.error("Proxy: Token refresh failed:", reissueResponse.status);
      return redirectToLoginModal(request, { clearAuth: true, error: "session_expired" });
    }

    const response = NextResponse.next();
    const payload = (await reissueResponse.json()) as RefreshResponseBody;
    // 재발급 응답 스키마는 고정 계약으로 가정하고 body 토큰을 바로 쿠키에 저장한다.
    setAuthCookies(response.cookies, {
      accessToken: payload.result.accessToken,
      refreshToken: payload.result.refreshToken,
    });

    return response;
  } catch (error) {
    console.error("Proxy: Token refresh error:", error);
    return redirectToLoginModal(request, { clearAuth: true, error: "network_error" });
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
