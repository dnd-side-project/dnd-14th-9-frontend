import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { SERVER_API_URL } from "@/lib/api/api-client";
import { setAuthCookies } from "@/lib/auth/auth-cookies";
import { redirectToLogin } from "@/lib/auth/login-redirect-utils";
import { exchangeAuthCode } from "@/lib/auth/oauth-code-exchange";
import { isLoginProvider } from "@/lib/auth/oauth-provider-policy";
import { takeOAuthCodeVerifier } from "@/lib/auth/oauth-verifier-cookie";
import {
  consumeRedirectAfterLoginCookie,
  getRedirectAfterLoginPath,
} from "@/lib/auth/redirect-after-login-cookie";
import { BACKEND_ERROR_CODES, LOGIN_INTERNAL_ERROR_CODES } from "@/lib/error/error-codes";

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

  // 결과와 상관없이 읽자마자 지운다.
  const codeVerifier = takeOAuthCodeVerifier(cookieStore);

  // OAuth 에러 처리 (사용자가 인증 취소 등)
  if (error) {
    return redirectToLogin(request, error);
  }

  const code = searchParams.get("code");

  if (!code || !codeVerifier) {
    console.error("OAuth callback: Missing authorization code or code verifier");
    return redirectToLogin(request, BACKEND_ERROR_CODES.OAUTH2_LOGIN_FAILED);
  }

  if (!SERVER_API_URL) {
    console.error("OAuth callback: Backend API base is not configured");
    return redirectToLogin(request, LOGIN_INTERNAL_ERROR_CODES.CONFIG_ERROR);
  }

  const outcome = await exchangeAuthCode(SERVER_API_URL, code, codeVerifier);

  if (outcome.kind === "failure") {
    console.error(
      `OAuth callback: Code exchange failed (${outcome.reason}, ${outcome.status}, ${outcome.errorCode ?? "-"})`
    );

    const isNetworkFailure = outcome.reason === "timeout" || outcome.reason === "network_error";

    return redirectToLogin(
      request,
      isNetworkFailure
        ? LOGIN_INTERNAL_ERROR_CODES.NETWORK_ERROR
        : BACKEND_ERROR_CODES.OAUTH2_LOGIN_FAILED
    );
  }

  setAuthCookies(cookieStore, outcome.tokens);
  // 인증 성공 시 복귀 경로 쿠키를 1회성으로 소비한다.
  consumeRedirectAfterLoginCookie(cookieStore);

  // 인증 성공 - 저장된 경로 또는 홈으로 리다이렉트
  return NextResponse.redirect(new URL(redirectPath, request.url));
}
