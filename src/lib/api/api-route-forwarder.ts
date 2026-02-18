import { NextRequest, NextResponse } from "next/server";

import { clearAuthCookies } from "@/lib/auth/auth-cookies";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookie-constants";

import { api } from "./api";

export type ForwardMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ForwardToBackendOptions {
  request?: NextRequest;
  method: ForwardMethod;
  pathWithQuery: string;
  /** Request body 처리 방식: 'json' | 'formData' | false (기본값: false) */
  includeRequestBody?: "json" | "formData" | false;
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

  const headers: Record<string, string> = {};

  const cookie = options.request.headers.get("cookie");
  if (cookie) {
    headers.Cookie = cookie;
  }

  // 쿠키에서 accessToken을 읽어 Authorization 헤더 구성
  const accessToken = options.request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return Object.keys(headers).length > 0 ? headers : undefined;
}

export async function forwardToBackend(options: ForwardToBackendOptions) {
  let body: unknown;
  let extraHeaders: Record<string, string> | undefined;

  if (options.includeRequestBody && options.request) {
    if (options.includeRequestBody === "json") {
      body = await options.request.json().catch(() => undefined);
    } else if (options.includeRequestBody === "formData") {
      // FormData를 직접 파싱하지 않고, 원본 Body(ArrayBuffer)와 Content-Type(boundary 포함)을 그대로 전달
      body = await options.request.arrayBuffer();
      const contentType = options.request.headers.get("content-type");
      if (contentType) {
        extraHeaders = { "Content-Type": contentType };
      }
    }
  }

  try {
    const response = await api.server.request(options.method, options.pathWithQuery, body, {
      headers: { ...buildForwardHeaders(options), ...extraHeaders },
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
