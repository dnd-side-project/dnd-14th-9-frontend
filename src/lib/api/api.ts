import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookie-constants";

import {
  API_URL,
  SERVER_API_URL,
  type RetryOptions,
  type RequestMethod,
  executeFetch,
} from "./api-client";

interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | null | undefined> | string;
  timeout?: number;
  retry?: RetryOptions;
  signal?: AbortSignal;
  skipAuth?: boolean;
  throwOnHttpError?: boolean;
}

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? process.env.NEXT_PUBLIC_FRONTEND_ORIGIN;

// next/headers 모듈 캐싱 — 매 요청마다 동적 import를 반복하지 않음
let cachedCookiesFn:
  | (() => Promise<{ get: (name: string) => { value: string } | undefined }>)
  | null = null;

let cachedHeadersFn: (() => Promise<{ get: (name: string) => string | null }>) | null = null;

async function getCookiesFn() {
  if (!cachedCookiesFn) {
    const { cookies } = await import("next/headers");
    cachedCookiesFn = cookies;
  }
  return cachedCookiesFn;
}

async function getHeadersFn() {
  if (!cachedHeadersFn) {
    const { headers } = await import("next/headers");
    cachedHeadersFn = headers as () => Promise<{ get: (name: string) => string | null }>;
  }
  return cachedHeadersFn;
}

function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

function buildUrl(endpoint: string, isServer: boolean, params?: RequestOptions["params"]): URL {
  let url: URL;

  if (isAbsoluteUrl(endpoint)) {
    url = new URL(endpoint);
  } else if (isServer) {
    const isLocalApiEndpoint = /^\/api(?:\/|$)/.test(endpoint);

    if (isLocalApiEndpoint) {
      if (!FRONTEND_ORIGIN) {
        throw new Error("Frontend origin is not configured for /api endpoints");
      }
      url = new URL(endpoint, FRONTEND_ORIGIN);
    } else {
      const baseUrl = SERVER_API_URL || API_URL;
      if (!baseUrl) {
        throw new Error("Server API base URL is not configured");
      }
      url = new URL(`${baseUrl}${endpoint}`);
    }
  } else {
    url = new URL(endpoint, window.location.origin);
  }

  if (params) {
    if (typeof params === "string") {
      const queryString = params;
      if (queryString) {
        url.search = queryString.startsWith("?") ? queryString : `?${queryString}`;
      }
    } else {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.append(key, String(value));
        }
      });
    }
  }

  return url;
}

async function buildHeaders(
  isServer: boolean,
  endpoint: string,
  options?: RequestOptions,
  hasBody: boolean = false,
  isFormData: boolean = false
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    ...options?.headers,
  };

  // FormData는 브라우저가 Content-Type을 자동 설정 (boundary 포함)
  if (hasBody && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  // 서버 사이드에서만 httpOnly 쿠키 접근 가능
  if (isServer && !options?.skipAuth) {
    const cookies = await getCookiesFn();
    const cookieStore = await cookies();
    const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // 서버에서 내부 /api 호출 시 현재 요청의 쿠키를 전달해 Route Handler 인증 컨텍스트를 유지한다.
    if (/^\/api(?:\/|$)/.test(endpoint) && !headers.Cookie) {
      const requestHeaders = await getHeadersFn();
      const headerStore = await requestHeaders();
      const cookieHeader = headerStore.get("cookie");
      if (cookieHeader) {
        headers.Cookie = cookieHeader;
      }
    }
  }

  return headers;
}

async function createRequestContext(
  method: RequestMethod,
  endpoint: string,
  data?: unknown,
  options?: RequestOptions
) {
  const isServer = typeof window === "undefined";
  const hasBody = data !== undefined && method !== "GET";
  const isFormData = data instanceof FormData;
  const url = buildUrl(endpoint, isServer, options?.params);
  const headers = await buildHeaders(isServer, endpoint, options, hasBody, isFormData);

  const requestInit: RequestInit = {
    method,
    headers,
    body: hasBody ? (isFormData ? data : JSON.stringify(data)) : undefined,
  };

  if (!isServer) {
    requestInit.credentials = "include";
  }

  return { url, requestInit, isServer };
}

async function request<T>(
  method: RequestMethod,
  endpoint: string,
  data?: unknown,
  options?: RequestOptions
): Promise<T> {
  const { url, requestInit } = await createRequestContext(method, endpoint, data, options);

  return executeFetch<T>(method, url.toString(), requestInit, {
    timeout: options?.timeout,
    retry: options?.retry,
    signal: options?.signal,
    responseType: "json",
    throwOnHttpError: options?.throwOnHttpError ?? true,
  });
}

async function requestRaw(
  method: RequestMethod,
  endpoint: string,
  data?: unknown,
  options?: RequestOptions
): Promise<Response> {
  const { url, requestInit } = await createRequestContext(method, endpoint, data, options);

  return executeFetch(method, url.toString(), requestInit, {
    timeout: options?.timeout,
    retry: options?.retry,
    signal: options?.signal,
    responseType: "raw",
    throwOnHttpError: options?.throwOnHttpError ?? false,
  });
}

const serverRequestApi = {
  request: (method: RequestMethod, endpoint: string, data?: unknown, options?: RequestOptions) =>
    requestRaw(method, endpoint, data, options),

  get: (endpoint: string, options?: RequestOptions) =>
    requestRaw("GET", endpoint, undefined, options),

  post: (endpoint: string, data?: unknown, options?: RequestOptions) =>
    requestRaw("POST", endpoint, data, options),

  put: (endpoint: string, data?: unknown, options?: RequestOptions) =>
    requestRaw("PUT", endpoint, data, options),

  patch: (endpoint: string, data?: unknown, options?: RequestOptions) =>
    requestRaw("PATCH", endpoint, data, options),

  delete: (endpoint: string, options?: RequestOptions) =>
    requestRaw("DELETE", endpoint, undefined, options),
};

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>("GET", endpoint, undefined, options),

  post: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>("POST", endpoint, data, options),

  put: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>("PUT", endpoint, data, options),

  patch: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>("PATCH", endpoint, data, options),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>("DELETE", endpoint, undefined, options),

  // Route Handler/BFF 레이어에서 사용하는 raw Response 기반 호출
  server: serverRequestApi,
};
