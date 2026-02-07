import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/auth/cookies";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const error = searchParams.get("error");

  // OAuth 에러 처리 (사용자가 인증 취소 등)
  if (error) {
    return NextResponse.redirect(new URL(`/?showLogin=true&error=${error}`, request.url));
  }

  // Query parameter에서 토큰 추출
  const accessToken = searchParams.get("accessToken");
  const refreshToken = searchParams.get("refreshToken");

  if (!accessToken || !refreshToken) {
    console.error("OAuth callback: No tokens in query parameters");
    return NextResponse.redirect(new URL("/?showLogin=true&error=no_token", request.url));
  }

  const cookieStore = await cookies();
  setAuthCookies(cookieStore, { accessToken, refreshToken });

  // 원래 접근하려던 경로로 리다이렉트
  const redirectPath = cookieStore.get("redirectAfterLogin")?.value || "/";

  // 사용 후 쿠키 삭제
  cookieStore.delete("redirectAfterLogin");

  // 인증 성공 - 저장된 경로 또는 홈으로 리다이렉트
  return NextResponse.redirect(new URL(redirectPath, request.url));
}
