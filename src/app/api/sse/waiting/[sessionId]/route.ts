import { NextRequest } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookie-constants";

const SERVER_API_URL = process.env.BACKEND_API_BASE ?? process.env.NEXT_PUBLIC_BACKEND_API_BASE;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  const backendUrl = `${SERVER_API_URL}/api/v1/sessions/sse/waiting/${sessionId}`;

  try {
    const response = await fetch(backendUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "text/event-stream",
      },
    });

    if (!response.ok) {
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
