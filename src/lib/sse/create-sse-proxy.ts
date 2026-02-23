import { NextRequest } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookie-constants";

const SERVER_API_URL = process.env.BACKEND_API_BASE ?? process.env.NEXT_PUBLIC_BACKEND_API_BASE;

interface CreateSSEProxyHandlerOptions {
  buildBackendUrl: (baseUrl: string, sessionId: string) => string;
}

export function createSSEProxyHandler(options: CreateSSEProxyHandlerOptions) {
  return async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
  ) {
    const { sessionId } = await params;
    const rawToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

    if (!rawToken) {
      return new Response("Unauthorized", { status: 401 });
    }

    const backendUrl = options.buildBackendUrl(SERVER_API_URL ?? "", sessionId);
    const abortController = new AbortController();

    request.signal.addEventListener("abort", () => {
      abortController.abort();
    });

    try {
      const response = await fetch(backendUrl, {
        headers: {
          Authorization: `Bearer ${rawToken}`,
          Accept: "text/event-stream",
        },
        cache: "no-store",
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[SSE Proxy] Error response:", response.status, errorText);
        return new Response(response.statusText, { status: response.status });
      }

      const stream = new ReadableStream({
        async start(controller) {
          const reader = response.body?.getReader();
          if (!reader) {
            controller.close();
            return;
          }

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              controller.enqueue(value);
            }
          } catch {
            // 클라이언트/백엔드 연결 해제 시 정상 종료
          } finally {
            try {
              controller.close();
            } catch {
              // 이미 닫힌 스트림 무시
            }
          }
        },
        cancel() {
          abortController.abort();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    } catch (error) {
      const isAbort = error instanceof DOMException && error.name === "AbortError";
      const isSocketClosed = error instanceof Error && error.message.includes("other side closed");

      if (isAbort || isSocketClosed) {
        return new Response(null, { status: 499 });
      }

      console.error("[SSE Proxy] Connection error:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  };
}
