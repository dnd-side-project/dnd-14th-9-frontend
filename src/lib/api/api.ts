import type { ApiErrorResponse } from "@/types/shared/types";
import {
  API_URL,
  ApiError,
  NetworkError,
  TimeoutError,
  type RetryOptions,
  type RequestMethod,
  log,
  sleep,
  shouldRetry,
  buildRetryConfig,
} from "./api-client";

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

  const retryConfig = buildRetryConfig(options?.retry);

  const timeout = options?.timeout ?? 30000;
  let attempt = 0;

  while (true) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const config: RequestInit = {
        method,
        headers,
        credentials: "include",
        signal: options?.signal || controller.signal,
      };

      if (data && method !== "GET") {
        config.body = JSON.stringify(data);
      }

      log("request", method, url.toString(), data);

      const response = await fetch(url.toString(), config);

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData: ApiErrorResponse | null = null;
        try {
          errorData = await response.json();
        } catch {
          // JSON 파싱 실패 시 무시
        }

        const error = new ApiError(
          errorData?.error.message ?? `API Error: ${response.status}`,
          response.status,
          errorData
        );

        if (shouldRetry(error, attempt, retryConfig.maxRetries, retryConfig.retryableStatuses)) {
          attempt++;
          const delay = retryConfig.retryDelay * Math.pow(2, attempt - 1);
          log("error", `Retry ${attempt}/${retryConfig.maxRetries} after ${delay}ms`, error);
          await sleep(delay);
          continue;
        }

        log("error", response.status, errorData);
        throw error;
      }

      if (response.status === 204) {
        log("response", response.status, "No Content");
        return null as T;
      }

      const responseData = await response.json();
      log("response", response.status, responseData);
      return responseData;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        const timeoutError = new TimeoutError("Request timeout or cancelled");
        log("error", timeoutError);
        throw timeoutError;
      }

      if (error instanceof ApiError) {
        throw error;
      }

      const networkError = new NetworkError("Network request failed", error);

      if (
        shouldRetry(networkError, attempt, retryConfig.maxRetries, retryConfig.retryableStatuses)
      ) {
        attempt++;
        const delay = retryConfig.retryDelay * Math.pow(2, attempt - 1);
        log("error", `Retry ${attempt}/${retryConfig.maxRetries} after ${delay}ms`, networkError);
        await sleep(delay);
        continue;
      }

      log("error", networkError);
      throw networkError;
    }
  }
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
