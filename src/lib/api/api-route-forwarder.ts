import { NextRequest, NextResponse } from "next/server";

import { clearAuthCookies, setAuthCookies } from "@/lib/auth/auth-cookies";
import { REFRESH_TOKEN_COOKIE } from "@/lib/auth/cookie-constants";
import {
  buildRefreshCookieHeader,
  getCookieValue,
  mergeCookieHeaderWithAuthTokens,
} from "@/lib/auth/cookie-header-utils";
import { parseRefreshTokenPair, type RefreshTokenPair } from "@/lib/auth/token-refresh-utils";

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

interface AuthRetryResult {
  response: Response;
  refreshedTokens: RefreshTokenPair | null;
  shouldClearAuthCookies: boolean;
}

function getDefaultErrorResponse(status: number, statusText: string) {
  return {
    isSuccess: false,
    code: "INTERNAL_ERROR",
    result: null,
    message: `요청 실패: ${status} ${statusText}`,
  };
}

async function parseForwardBody(options: ForwardToBackendOptions): Promise<unknown> {
  if (!options.request || !options.includeRequestBody) {
    return undefined;
  }

  if (options.includeRequestBody === "json") {
    return options.request.json().catch(() => undefined);
  }

  if (options.includeRequestBody === "formData") {
    return options.request.formData().catch(() => undefined);
  }

  return undefined;
}

function buildForwardHeaders(
  options: ForwardToBackendOptions,
  cookieHeaderOverride?: string | null
): Record<string, string> | undefined {
  if (!options.request || !options.forwardRequestCookies) {
    return undefined;
  }

  const cookie = cookieHeaderOverride ?? options.request.headers.get("cookie");
  if (!cookie) {
    return undefined;
  }

  return { Cookie: cookie };
}

async function sendBackendRequest(
  options: ForwardToBackendOptions,
  body: unknown,
  cookieHeaderOverride?: string | null
) {
  return api.server.request(options.method, options.pathWithQuery, body, {
    headers: buildForwardHeaders(options, cookieHeaderOverride),
    throwOnHttpError: false,
    // BFF는 전달받은 쿠키만 사용하고, 서버 전역 쿠키에서 Authorization을 주입하지 않는다.
    skipAuth: true,
  });
}

async function refreshTokens(refreshToken: string): Promise<RefreshTokenPair | null> {
  const refreshResponse = await api.server.request("POST", "/auth/refresh", undefined, {
    headers: { Cookie: buildRefreshCookieHeader(refreshToken) },
    throwOnHttpError: false,
    skipAuth: true,
  });

  if (!refreshResponse.ok) {
    return null;
  }

  const responseBody: unknown = await refreshResponse.json().catch(() => null);
  return parseRefreshTokenPair(responseBody);
}

function canRetryWithRefresh(response: Response, options: ForwardToBackendOptions): boolean {
  return (
    response.status === 401 &&
    Boolean(options.forwardRequestCookies) &&
    Boolean(options.request) &&
    options.pathWithQuery !== "/auth/refresh"
  );
}

async function resolveResponseWithAuthRetry(
  options: ForwardToBackendOptions,
  body: unknown,
  originalCookieHeader: string | null,
  initialResponse: Response
): Promise<AuthRetryResult> {
  if (!canRetryWithRefresh(initialResponse, options)) {
    return {
      response: initialResponse,
      refreshedTokens: null,
      shouldClearAuthCookies: false,
    };
  }

  const refreshToken = getCookieValue(originalCookieHeader, REFRESH_TOKEN_COOKIE);
  if (!refreshToken) {
    return {
      response: initialResponse,
      refreshedTokens: null,
      shouldClearAuthCookies: true,
    };
  }

  const refreshedTokens = await refreshTokens(refreshToken);
  if (!refreshedTokens) {
    return {
      response: initialResponse,
      refreshedTokens: null,
      shouldClearAuthCookies: true,
    };
  }

  const retryCookieHeader = mergeCookieHeaderWithAuthTokens(originalCookieHeader, refreshedTokens);
  const retriedResponse = await sendBackendRequest(options, body, retryCookieHeader);

  if (retriedResponse.status === 401 || retriedResponse.status === 403) {
    return {
      response: retriedResponse,
      refreshedTokens: null,
      shouldClearAuthCookies: true,
    };
  }

  return {
    response: retriedResponse,
    refreshedTokens,
    shouldClearAuthCookies: false,
  };
}

function applyAuthCookies(
  nextResponse: NextResponse,
  options: ForwardToBackendOptions,
  response: Response,
  refreshedTokens: RefreshTokenPair | null,
  shouldClearAuthCookies: boolean
) {
  if (options.clearAuthCookiesOnSuccess && response.ok) {
    clearAuthCookies(nextResponse.cookies);
    return;
  }

  if (refreshedTokens) {
    setAuthCookies(nextResponse.cookies, refreshedTokens);
  }

  if (shouldClearAuthCookies) {
    clearAuthCookies(nextResponse.cookies);
  }
}

async function parseBackendResponsePayload(response: Response): Promise<unknown> {
  const responseText = await response.text();
  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return getDefaultErrorResponse(response.status, response.statusText);
  }
}

export async function forwardToBackend(options: ForwardToBackendOptions) {
  const body = await parseForwardBody(options);
  const originalCookieHeader = options.request?.headers.get("cookie") ?? null;

  try {
    const initialResponse = await sendBackendRequest(options, body, originalCookieHeader);
    const { response, refreshedTokens, shouldClearAuthCookies } =
      await resolveResponseWithAuthRetry(options, body, originalCookieHeader, initialResponse);

    if (response.status === 204) {
      const noContentResponse = new NextResponse(null, { status: 204 });
      applyAuthCookies(
        noContentResponse,
        options,
        response,
        refreshedTokens,
        shouldClearAuthCookies
      );
      return noContentResponse;
    }

    const responsePayload = await parseBackendResponsePayload(response);

    const nextResponse = NextResponse.json(
      responsePayload ?? getDefaultErrorResponse(response.status, response.statusText),
      { status: response.status }
    );

    applyAuthCookies(nextResponse, options, response, refreshedTokens, shouldClearAuthCookies);

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
