/* eslint-disable no-console */
import { NextRequest } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookie-constants";

const SERVER_API_URL = process.env.BACKEND_API_BASE ?? process.env.NEXT_PUBLIC_BACKEND_API_BASE;

interface CreateSSEProxyHandlerOptions<TParams extends Record<string, string>> {
  buildBackendUrl: (baseUrl: string, params: TParams) => string;
}

export function createSSEProxyHandler<TParams extends Record<string, string>>(
  options: CreateSSEProxyHandlerOptions<TParams>
) {
  return async function GET(request: NextRequest, { params }: { params: Promise<TParams> }) {
    const resolvedParams = await params;
    const rawToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
    const pathname = request.nextUrl.pathname;

    if (!rawToken) {
      console.warn("[SSE Proxy] 401 Unauthorized — accessToken cookie missing", { pathname });
      return new Response("Unauthorized", { status: 401 });
    }

    const backendUrl = options.buildBackendUrl(SERVER_API_URL ?? "", resolvedParams);
    console.log("[SSE Proxy] → connecting", {
      pathname,
      backendUrl,
      tokenPreview: `${rawToken.slice(0, 8)}…(len=${rawToken.length})`,
    });

    const abortController = new AbortController();
    request.signal.addEventListener("abort", () => {
      console.log("[SSE Proxy] client aborted", { pathname });
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

      console.log("[SSE Proxy] ← backend response", {
        pathname,
        status: response.status,
        ok: response.ok,
        contentType: response.headers.get("content-type"),
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
            console.log("[SSE Proxy] stream closed", { pathname });
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
