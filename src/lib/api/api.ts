import { API_URL, type RetryOptions, type RequestMethod, executeFetch } from "./api-client";

interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | null | undefined> | string;
  timeout?: number;
  retry?: RetryOptions;
  signal?: AbortSignal;
}

// next/headers 모듈 캐싱 — 매 요청마다 동적 import를 반복하지 않음
let cachedCookiesFn:
  | (() => Promise<{ get: (name: string) => { value: string } | undefined }>)
  | null = null;

async function getCookiesFn() {
  if (!cachedCookiesFn) {
    const { cookies } = await import("next/headers");
    cachedCookiesFn = cookies;
  }
  return cachedCookiesFn;
}

async function request<T>(
  method: RequestMethod,
  endpoint: string,
  data?: unknown,
  options?: RequestOptions
): Promise<T> {
  const isServer = typeof window === "undefined";

  // 서버: 백엔드 API 직접 호출, 클라이언트: Next.js API Route 프록시 사용
  const baseUrl = isServer ? API_URL || "" : "";
  const url = new URL(`${baseUrl}${endpoint}`, isServer ? undefined : window.location.origin);

  if (options?.params) {
    if (typeof options.params === "string") {
      const queryString = options.params;
      if (queryString) {
        url.search = queryString.startsWith("?") ? queryString : `?${queryString}`;
      }
    } else {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.append(key, String(value));
        }
      });
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options?.headers,
  };

  // 서버 환경에서 쿠키에서 토큰 가져오기 (캐싱된 import 사용)
  if (isServer) {
    const cookies = await getCookiesFn();
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return executeFetch<T>(
    method,
    url.toString(),
    {
      method,
      headers,
      credentials: "include",
      body: data && method !== "GET" ? JSON.stringify(data) : undefined,
    },
    {
      timeout: options?.timeout,
      retry: options?.retry,
      signal: options?.signal,
    }
  );
}

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
};
