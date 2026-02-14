import { NextRequest, NextResponse } from "next/server";

import { SERVER_API_URL } from "@/lib/api/api-client";

function getDefaultErrorResponse(status: number, statusText: string) {
  return {
    isSuccess: false,
    code: "INTERNAL_ERROR",
    result: null,
    message: `요청 실패: ${status} ${statusText}`,
  };
}

export async function PATCH(request: NextRequest) {
  if (!SERVER_API_URL) {
    return NextResponse.json(
      {
        isSuccess: false,
        code: "CONFIG_ERROR",
        result: null,
        message: "Server API base URL is not configured",
      },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const cookie = request.headers.get("cookie");

  try {
    const response = await fetch(`${SERVER_API_URL}/members/me/profile-image`, {
      method: "PATCH",
      headers: cookie ? { Cookie: cookie } : undefined,
      body: formData,
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const responseText = await response.text();
    let responsePayload: unknown = null;

    if (responseText) {
      try {
        responsePayload = JSON.parse(responseText);
      } catch {
        responsePayload = getDefaultErrorResponse(response.status, response.statusText);
      }
    }

    return NextResponse.json(
      responsePayload ?? getDefaultErrorResponse(response.status, response.statusText),
      { status: response.status }
    );
  } catch (error) {
    console.error("BFF proxy error:", error);

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
