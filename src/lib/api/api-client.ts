/* eslint-disable no-console */
import type { ApiErrorResponse } from "@/types/shared/types";

const isDev = process.env.NODE_ENV === "development";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// Orval용 타입
type RequestConfig = {
  url: string;
  method: RequestMethod;
  params?: Record<string, string>;
  data?: unknown;
  headers?: HeadersInit;
  signal?: AbortSignal;
  timeout?: number;
  retry?: RetryOptions;
};

// 직접 사용용 타입
interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  timeout?: number;
  retry?: RetryOptions;
  signal?: AbortSignal;
}

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  retryableStatuses?: number[];
}

// ===== 에러 클래스 =====

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: ApiErrorResponse | null
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = "NetworkError";
  }
}

export class TimeoutError extends Error {
  constructor(message: string = "Request timeout") {
    super(message);
    this.name = "TimeoutError";
  }
}

// ===== 유틸리티 함수 =====

function log(type: "request" | "response" | "error", ...args: unknown[]) {
  if (!isDev) return;
  const prefix = {
    request: "🔵 [API Request]",
    response: "🟢 [API Response]",
    error: "🔴 [API Error]",
  };
  console.log(prefix[type], ...args);
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function shouldRetry(
  error: unknown,
  attempt: number,
  maxRetries: number,
  retryableStatuses: number[]
): Promise<boolean> {
  if (attempt >= maxRetries) return false;
  if (error instanceof NetworkError) return true;
  if (error instanceof ApiError && retryableStatuses.includes(error.status)) {
    return true;
  }
  return false;
}

// ===== Orval용 customInstance =====

export const customInstance = async <T>({
  url,
  method,
  params,
  data,
  headers,
  signal,
  timeout = 30000,
  retry,
}: RequestConfig): Promise<T> => {
  const baseURL = API_URL!;

  const searchParams = new URLSearchParams(params);
  const queryString = searchParams.toString();
  const fullUrl = queryString ? `${baseURL}${url}?${queryString}` : `${baseURL}${url}`;

  const retryConfig = {
    maxRetries: retry?.maxRetries ?? 3,
    retryDelay: retry?.retryDelay ?? 1000,
    retryableStatuses: retry?.retryableStatuses ?? [408, 429, 500, 502, 503, 504],
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let attempt = 0;
  let lastError: unknown;

  while (attempt <= retryConfig.maxRetries) {
    try {
      log("request", method, fullUrl, data);

      const response = await fetch(fullUrl, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: signal || controller.signal,
      });

      if (!response.ok) {
        let errorData: ApiErrorResponse | null = null;
        try {
          errorData = await response.json();
        } catch {
          // JSON 파싱 실패 시 무시
        }

        const error = new ApiError(
          errorData?.error.message ?? `HTTP error! status: ${response.status}`,
          response.status,
          errorData
        );

        if (
          await shouldRetry(error, attempt, retryConfig.maxRetries, retryConfig.retryableStatuses)
        ) {
          attempt++;
          const delay = retryConfig.retryDelay * Math.pow(2, attempt - 1);
          log("error", `Retry ${attempt}/${retryConfig.maxRetries} after ${delay}ms`, error);
          await sleep(delay);
          continue;
        }

        log("error", response.status, errorData);
        throw error;
      }

      clearTimeout(timeoutId);

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
        await shouldRetry(
          networkError,
          attempt,
          retryConfig.maxRetries,
          retryConfig.retryableStatuses
        )
      ) {
        attempt++;
        const delay = retryConfig.retryDelay * Math.pow(2, attempt - 1);
        log("error", `Retry ${attempt}/${retryConfig.maxRetries} after ${delay}ms`, networkError);
        await sleep(delay);
        lastError = networkError;
        continue;
      }

      log("error", networkError);
      throw networkError;
    }
  }

  throw lastError;
};

// ===== 직접 사용용 API 객체 =====

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
    Object.entries(options.params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options?.headers,
  };

  // 서버 환경에서 쿠키에서 토큰 가져오기
  if (isServer) {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const retryConfig = {
    maxRetries: options?.retry?.maxRetries ?? 3,
    retryDelay: options?.retry?.retryDelay ?? 1000,
    retryableStatuses: options?.retry?.retryableStatuses ?? [408, 429, 500, 502, 503, 504],
  };

  const timeout = options?.timeout ?? 30000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let attempt = 0;
  let lastError: unknown;

  while (attempt <= retryConfig.maxRetries) {
    try {
      const config: RequestInit = {
        method,
        headers,
        credentials: "include", // 클라이언트에서 쿠키 자동 전송
        signal: options?.signal || controller.signal,
      };

      if (data && method !== "GET") {
        config.body = JSON.stringify(data);
      }

      log("request", method, url.toString(), data);

      const response = await fetch(url.toString(), config);

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

        if (
          await shouldRetry(error, attempt, retryConfig.maxRetries, retryConfig.retryableStatuses)
        ) {
          attempt++;
          const delay = retryConfig.retryDelay * Math.pow(2, attempt - 1);
          log("error", `Retry ${attempt}/${retryConfig.maxRetries} after ${delay}ms`, error);
          await sleep(delay);
          continue;
        }

        log("error", response.status, errorData);
        throw error;
      }

      clearTimeout(timeoutId);

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
        await shouldRetry(
          networkError,
          attempt,
          retryConfig.maxRetries,
          retryConfig.retryableStatuses
        )
      ) {
        attempt++;
        const delay = retryConfig.retryDelay * Math.pow(2, attempt - 1);
        log("error", `Retry ${attempt}/${retryConfig.maxRetries} after ${delay}ms`, networkError);
        await sleep(delay);
        lastError = networkError;
        continue;
      }

      log("error", networkError);
      throw networkError;
    }
  }

  throw lastError;
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

export default customInstance;
