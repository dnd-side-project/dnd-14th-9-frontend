import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { setAuthCookies } from "@/lib/auth/auth-cookies";
import {
  consumeRedirectAfterLoginCookie,
  getCallbackTokens,
  getRedirectAfterLoginPath,
  redirectToLogin,
} from "@/lib/auth/auth-route-utils";
import { isLoginProvider } from "@/lib/auth/login-policy";
import { BACKEND_ERROR_CODES } from "@/lib/error/error-codes";

interface CallbackRouteContext {
  params: Promise<{
    provider: string;
  }>;
}

export async function GET(request: NextRequest, context: CallbackRouteContext) {
  const { provider } = await context.params;

  const cookieStore = await cookies();

  if (!isLoginProvider(provider)) {
    return redirectToLogin(request, BACKEND_ERROR_CODES.OAUTH2_UNSUPPORTED_PROVIDER);
  }

  const searchParams = request.nextUrl.searchParams;
  const error = searchParams.get("error");
  const redirectPath = getRedirectAfterLoginPath(cookieStore);

  // OAuth 에러 처리 (사용자가 인증 취소 등)
  if (error) {
    return redirectToLogin(request, error);
  }

  // Query parameter에서 토큰 추출
  const { accessToken, refreshToken } = getCallbackTokens(searchParams);

  if (!accessToken || !refreshToken) {
    console.error("OAuth callback: No tokens in query parameters");
    return redirectToLogin(request, BACKEND_ERROR_CODES.OAUTH2_LOGIN_FAILED);
  }

  setAuthCookies(cookieStore, { accessToken, refreshToken });
  // 인증 성공 시 복귀 경로 쿠키를 1회성으로 소비한다.
  consumeRedirectAfterLoginCookie(cookieStore);

  // 인증 성공 - 저장된 경로 또는 홈으로 리다이렉트
  return NextResponse.redirect(new URL(redirectPath, request.url));
}
