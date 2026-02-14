import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { SERVER_API_URL, API_URL } from "@/lib/api/api-client";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookie-constants";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

    if (!token) {
      return NextResponse.json(
        {
          isSuccess: false,
          code: "AUTH_ERROR",
          result: null,
          message: "인증이 필요합니다.",
        },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const baseUrl = SERVER_API_URL || API_URL;

    const response = await fetch(`${baseUrl}/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const responseText = await response.text();
    let responsePayload: unknown = null;

    if (responseText) {
      try {
        responsePayload = JSON.parse(responseText);
      } catch {
        responsePayload = {
          isSuccess: false,
          code: "INTERNAL_ERROR",
          result: null,
          message: `요청 실패: ${response.status} ${response.statusText}`,
        };
      }
    }

    return NextResponse.json(responsePayload, { status: response.status });
  } catch (error) {
    console.error("Session creation error:", error);

    return NextResponse.json(
      {
        isSuccess: false,
        code: "NETWORK_ERROR",
        result: null,
        message: "네트워크 오류로 요청에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}
