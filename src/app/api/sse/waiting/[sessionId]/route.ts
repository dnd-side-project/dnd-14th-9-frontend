import { NextRequest } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookie-constants";

const SERVER_API_URL = process.env.BACKEND_API_BASE ?? process.env.NEXT_PUBLIC_BACKEND_API_BASE;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const rawToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!rawToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 쿠키 값이 URL 인코딩 되어있을 수 있음
  const accessToken = decodeURIComponent(rawToken);

  const backendUrl = `${SERVER_API_URL}/sessions/sse/waiting/${sessionId}`;

  console.warn("[SSE Proxy] Request URL:", backendUrl);
  console.warn("[SSE Proxy] Raw token:", rawToken.substring(0, 30) + "...");
  console.warn("[SSE Proxy] Decoded token:", accessToken.substring(0, 30) + "...");

  try {
    const response = await fetch(backendUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "text/event-stream",
      },
      cache: "no-store",
    });

    console.warn("[SSE Proxy] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[SSE Proxy] Error response:", errorText);
      return new Response(response.statusText, { status: response.status });
    }

    // SSE 스트림을 클라이언트로 전달
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[SSE Proxy] Connection error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
