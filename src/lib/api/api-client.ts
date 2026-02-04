/* eslint-disable no-console */
import type { ApiErrorResponse } from "@/types/shared/types";

export const isDev = process.env.NODE_ENV === "development";
export const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
