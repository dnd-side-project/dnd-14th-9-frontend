import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
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

  // 쿠키 저장 (백엔드 AuthCookieProvider 설정과 동기화)
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === "production";

  // accessToken 쿠키 설정 (1시간)
  cookieStore.set("accessToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax", // sameSite "none"은 secure: true 필수
    maxAge: 60 * 60, // 1시간
    path: "/",
  });

  // refreshToken 쿠키 설정 (30일)
  cookieStore.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax", // sameSite "none"은 secure: true 필수
    maxAge: 60 * 60 * 24 * 30, // 30일
    path: "/",
  });

  // 원래 접근하려던 경로로 리다이렉트
  const redirectPath = cookieStore.get("redirectAfterLogin")?.value || "/";

  // 사용 후 쿠키 삭제
  cookieStore.delete("redirectAfterLogin");

  // 인증 성공 - 저장된 경로 또는 홈으로 리다이렉트
  return NextResponse.redirect(new URL(redirectPath, request.url));
}
