import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { REDIRECT_AFTER_LOGIN_COOKIE } from "@/lib/auth/cookie-constants";
import { setAuthCookies } from "@/lib/auth/cookies";

function normalizeInternalPath(path: string | null | undefined): string {
  if (!path) return "/";
  if (!path.startsWith("/") || path.startsWith("//")) return "/";
  return path;
}

function buildLoginRedirectUrl(request: NextRequest, reason: string, nextPath: string): URL {
  const url = new URL("/login", request.url);
  url.searchParams.set("reason", reason);
  url.searchParams.set("next", normalizeInternalPath(nextPath));
  return url;
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const searchParams = request.nextUrl.searchParams;
  const error = searchParams.get("error");

  // OAuth 에러 처리 (사용자가 인증 취소 등)
  if (error) {
    const redirectPath = normalizeInternalPath(cookieStore.get(REDIRECT_AFTER_LOGIN_COOKIE)?.value);
    cookieStore.delete(REDIRECT_AFTER_LOGIN_COOKIE);
    return NextResponse.redirect(buildLoginRedirectUrl(request, error, redirectPath));
  }

  // Query parameter에서 토큰 추출
  const accessToken = searchParams.get("accessToken");
  const refreshToken = searchParams.get("refreshToken");

  if (!accessToken || !refreshToken) {
    console.error("OAuth callback: No tokens in query parameters");
    const redirectPath = normalizeInternalPath(cookieStore.get(REDIRECT_AFTER_LOGIN_COOKIE)?.value);
    cookieStore.delete(REDIRECT_AFTER_LOGIN_COOKIE);
    return NextResponse.redirect(buildLoginRedirectUrl(request, "no_token", redirectPath));
  }

  setAuthCookies(cookieStore, { accessToken, refreshToken });

  // 원래 접근하려던 경로로 리다이렉트
  const redirectPath = normalizeInternalPath(cookieStore.get(REDIRECT_AFTER_LOGIN_COOKIE)?.value);

  // 사용 후 쿠키 삭제
  cookieStore.delete(REDIRECT_AFTER_LOGIN_COOKIE);

  // 인증 성공 - 저장된 경로 또는 홈으로 리다이렉트
  return NextResponse.redirect(new URL(redirectPath, request.url));
}
