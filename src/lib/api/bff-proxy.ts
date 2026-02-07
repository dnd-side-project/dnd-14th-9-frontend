import { NextRequest, NextResponse } from "next/server";
import { api } from "./api";
import { clearAuthCookies } from "@/lib/auth/cookies";

export type ForwardMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ForwardToBackendOptions {
  request?: NextRequest;
  method: ForwardMethod;
  pathWithQuery: string;
  includeRequestBody?: boolean;
  clearAuthCookiesOnSuccess?: boolean;
  forwardRequestCookies?: boolean;
}

function getDefaultErrorResponse(status: number, statusText: string) {
  return {
    isSuccess: false,
    code: "INTERNAL_ERROR",
    result: null,
    message: `요청 실패: ${status} ${statusText}`,
  };
}

function buildForwardHeaders(options: ForwardToBackendOptions): Record<string, string> | undefined {
  if (!options.request || !options.forwardRequestCookies) {
    return undefined;
  }

  const cookie = options.request.headers.get("cookie");
  if (!cookie) {
    return undefined;
  }

  return { Cookie: cookie };
}

export async function forwardToBackend(options: ForwardToBackendOptions) {
  let body: unknown;

  if (options.includeRequestBody && options.request) {
    body = await options.request.json().catch(() => undefined);
  }

  try {
    const response = await api.server.request(options.method, options.pathWithQuery, body, {
      headers: buildForwardHeaders(options),
      throwOnHttpError: false,
    });

    if (response.status === 204) {
      const noContentResponse = new NextResponse(null, { status: 204 });

      if (options.clearAuthCookiesOnSuccess) {
        clearAuthCookies(noContentResponse.cookies);
      }

      return noContentResponse;
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

    const nextResponse = NextResponse.json(
      responsePayload ?? getDefaultErrorResponse(response.status, response.statusText),
      { status: response.status }
    );

    if (options.clearAuthCookiesOnSuccess && response.ok) {
      clearAuthCookies(nextResponse.cookies);
    }

    return nextResponse;
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
