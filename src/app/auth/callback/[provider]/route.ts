// app/auth/callback/[provider]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL;

export async function GET(request: NextRequest, { params }: { params: { provider: string } }) {
  const { provider } = params;
  const searchParams = request.nextUrl.searchParams;

  const code = searchParams.get("code");
  const error = searchParams.get("error");

  // 에러 처리 (사용자가 인증 취소 등)
  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${error}`, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", request.url));
  }

  try {
    // 백엔드에 code 전달하여 토큰 교환
    const response = await fetch(`${BACKEND_URL}/auth/${provider}/callback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error("Authentication failed");
    }

    const data = await response.json();
    // data: { accessToken, refreshToken, user }

    // 쿠키에 토큰 저장
    const cookieStore = await cookies();

    //TODO: token cookie naming 변경 가능성 존재.
    cookieStore.set("accessToken", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60, // 1시간
      path: "/",
    });

    cookieStore.set("refreshToken", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7일
      path: "/",
    });

    // 메인 페이지로 리다이렉트
    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
  }
}
