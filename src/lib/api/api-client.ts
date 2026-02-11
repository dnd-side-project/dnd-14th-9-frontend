/* eslint-disable no-console */
import { DEFAULT_API_ERROR_MESSAGE, getApiErrorMessageByCode } from "@/lib/api/api-error-messages";
import type { ApiErrorResponse } from "@/types/shared/types";

export interface ExecuteFetchOptions {
  timeout?: number;
  retry?: RetryOptions;
  signal?: AbortSignal;
  responseType?: "json" | "raw";
  throwOnHttpError?: boolean;
}

export const isDev = process.env.NODE_ENV === "development";
export const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const SERVER_API_URL =
  process.env.BACKEND_API_BASE ?? process.env.NEXT_PUBLIC_BACKEND_API_BASE ?? API_URL;

export type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface RetryOptions {
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

export function log(type: "request" | "response" | "error", ...args: unknown[]) {
  if (!isDev) return;
  const prefix = {
    request: "🔵 [API Request]",
    response: "🟢 [API Response]",
    error: "🔴 [API Error]",
  };
  console.log(prefix[type], ...args);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function shouldRetry(
  error: unknown,
  attempt: number,
  maxRetries: number,
  retryableStatuses: number[]
): boolean {
  if (attempt >= maxRetries) return false;
  if (error instanceof NetworkError) return true;
  if (error instanceof ApiError && retryableStatuses.includes(error.status)) {
    return true;
  }
  return false;
}

export function buildRetryConfig(retry?: RetryOptions) {
  return {
    maxRetries: retry?.maxRetries ?? 3,
    retryDelay: retry?.retryDelay ?? 1000,
    retryableStatuses: retry?.retryableStatuses ?? [408, 429, 500, 502, 503, 504],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (!isRecord(value)) return false;
  return (
    value.isSuccess === false && typeof value.code === "string" && typeof value.message === "string"
  );
}

function getApiErrorMessage(value: unknown, status: number): string {
  if (isApiErrorResponse(value)) {
    return getApiErrorMessageByCode(value.code) ?? value.message;
  }

  if (isRecord(value) && typeof value.code === "string") {
    const mappedMessage = getApiErrorMessageByCode(value.code);
    if (mappedMessage) return mappedMessage;
  }

  // 백엔드 스펙 전환 전 응답 포맷 호환 (success/error.message)
  if (isRecord(value) && isRecord(value.error) && typeof value.error.message === "string") {
    return value.error.message;
  }

  return status >= 500 ? DEFAULT_API_ERROR_MESSAGE : `HTTP error! status: ${status}`;
}

// ===== 공통 fetch 실행 =====

type ExecuteFetchResult<
  T,
  R extends ExecuteFetchOptions["responseType"] | undefined,
> = R extends "raw" ? Response : T;

export async function executeFetch<
  T = unknown,
  R extends ExecuteFetchOptions["responseType"] | undefined = "json",
>(
  method: RequestMethod,
  url: string,
  init: RequestInit,
  options?: ExecuteFetchOptions & { responseType?: R }
): Promise<ExecuteFetchResult<T, R>> {
  const retryConfig = buildRetryConfig(options?.retry);
  const timeout = options?.timeout ?? 30000;
  const responseType = options?.responseType ?? "json";
  const throwOnHttpError = options?.throwOnHttpError ?? true;
  let attempt = 0;

  while (true) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      log("request", method, url, init.body);

      const response = await fetch(url, {
        ...init,
        signal: options?.signal || controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const retryableError = new ApiError(
          `HTTP error! status: ${response.status}`,
          response.status
        );

        if (
          shouldRetry(
            retryableError,
            attempt,
            retryConfig.maxRetries,
            retryConfig.retryableStatuses
          )
        ) {
          attempt++;
          const delay = retryConfig.retryDelay * Math.pow(2, attempt - 1);
          log(
            "error",
            `Retry ${attempt}/${retryConfig.maxRetries} after ${delay}ms`,
            retryableError
          );
          await sleep(delay);
          continue;
        }

        if (throwOnHttpError) {
          let errorPayload: unknown = null;
          let errorData: ApiErrorResponse | null = null;
          try {
            errorPayload = await response.json();
            if (isApiErrorResponse(errorPayload)) {
              errorData = errorPayload;
            }
          } catch {
            // JSON 파싱 실패 시 무시
          }

          const error = new ApiError(
            getApiErrorMessage(errorPayload, response.status),
            response.status,
            errorData
          );

          log("error", response.status, errorData);
          throw error;
        }

        if (responseType === "raw") {
          return response as ExecuteFetchResult<T, R>;
        }
      }

      if (responseType === "raw") {
        return response as ExecuteFetchResult<T, R>;
      }

      if (response.status === 204) {
        log("response", response.status, "No Content");
        return null as ExecuteFetchResult<T, R>;
      }

      const responseData = (await response.json()) as T;
      log("response", response.status, responseData);
      return responseData as ExecuteFetchResult<T, R>;
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
