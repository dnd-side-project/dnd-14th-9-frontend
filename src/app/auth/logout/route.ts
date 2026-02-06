import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * 로그아웃 API Route
 * - 백엔드 로그아웃 API 호출
 * - 서버에서 쿠키 삭제 (httpOnly 쿠키 포함)
 */
export async function POST() {
  try {
    const cookieStore = await cookies();

    // 백엔드 로그아웃 API 호출
    // - refreshToken 쿠키를 자동으로 전송 (credentials: "include")
    // - 백엔드에서 refreshToken 쿠키 삭제 처리
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include", // refreshToken 쿠키 자동 전송
      headers: {
        "Content-Type": "application/json",
      },
    });

    // 백엔드 에러 응답 처리
    if (!response.ok) {
      // 백엔드가 보낸 에러 응답을 그대로 파싱하여 반환
      try {
        const errorData = await response.json();
        return NextResponse.json(errorData, { status: response.status });
      } catch {
        // JSON 파싱 실패 시 기본 에러 응답
        return NextResponse.json(
          {
            isSuccess: false,
            code: "INTERNAL_ERROR",
            result: null,
            message: `로그아웃 실패: ${response.status} ${response.statusText}`,
          },
          { status: response.status }
        );
      }
    }

    const data = await response.json();

    // accessToken 쿠키 삭제
    // - OAuth 콜백에서 프론트가 설정한 쿠키이므로 프론트에서 삭제
    // - refreshToken은 백엔드가 Set-Cookie 헤더로 이미 삭제함
    cookieStore.delete("accessToken");

    return NextResponse.json(data);
  } catch (error) {
    console.error("Logout error:", error);

    // 네트워크 에러 등 fetch 자체가 실패한 경우
    return NextResponse.json(
      {
        isSuccess: false,
        code: "NETWORK_ERROR",
        result: null,
        message: "네트워크 오류로 로그아웃에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}
