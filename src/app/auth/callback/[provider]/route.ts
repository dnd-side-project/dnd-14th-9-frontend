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
    return NextResponse.redirect(new URL(`/login?error=${error}`, request.url));
  }

  // 쿠키 검증 - 백엔드가 이미 쿠키를 설정했는지 확인
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken");

  if (!accessToken) {
    console.error("OAuth callback: No access token in cookies");
    return NextResponse.redirect(new URL("/login?error=no_token", request.url));
  }

  // 인증 성공 - 메인 페이지로 리다이렉트
  return NextResponse.redirect(new URL("/", request.url));
}
