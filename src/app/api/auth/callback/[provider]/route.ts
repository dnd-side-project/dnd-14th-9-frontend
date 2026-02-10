import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { isLoginProvider, normalizeInternalPath } from "@/lib/auth/login-policy";
import { REDIRECT_AFTER_LOGIN_COOKIE } from "@/lib/auth/cookie-constants";
import { setAuthCookies } from "@/lib/auth/auth-cookies";

function buildLoginRedirectUrl(request: NextRequest, reason: string): URL {
  const url = new URL("/login", request.url);
  url.searchParams.set("reason", reason);
  return url;
}

interface CallbackRouteContext {
  params: Promise<{
    provider: string;
  }>;
}

export async function GET(request: NextRequest, context: CallbackRouteContext) {
  const { provider } = await context.params;

  if (!isLoginProvider(provider)) {
    return NextResponse.redirect(buildLoginRedirectUrl(request, "access_denied"));
  }

  const cookieStore = await cookies();
  const searchParams = request.nextUrl.searchParams;
  const error = searchParams.get("error");
  const redirectPath = normalizeInternalPath(cookieStore.get(REDIRECT_AFTER_LOGIN_COOKIE)?.value);

  // OAuth 에러 처리 (사용자가 인증 취소 등)
  if (error) {
    return NextResponse.redirect(buildLoginRedirectUrl(request, error));
  }

  // Query parameter에서 토큰 추출
  const accessToken = searchParams.get("accessToken");
  const refreshToken = searchParams.get("refreshToken");

  if (!accessToken || !refreshToken) {
    console.error("OAuth callback: No tokens in query parameters");
    return NextResponse.redirect(buildLoginRedirectUrl(request, "no_token"));
  }

  setAuthCookies(cookieStore, { accessToken, refreshToken });
  // 인증 성공 시 복귀 경로 쿠키를 1회성으로 소비한다.
  cookieStore.delete(REDIRECT_AFTER_LOGIN_COOKIE);

  // 인증 성공 - 저장된 경로 또는 홈으로 리다이렉트
  return NextResponse.redirect(new URL(redirectPath, request.url));
}
