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
import { buildQueryString } from "@/lib/utils/url";

type RequestConfig = {
  url: string;
  method: RequestMethod;
  params?: Record<string, string | number | boolean | null | undefined>;
  data?: unknown;
  headers?: HeadersInit;
  signal?: AbortSignal;
  timeout?: number;
  retry?: RetryOptions;
};

const customInstance = async <T>({
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

  const queryString = params ? buildQueryString(params) : "";
  const fullUrl = queryString ? `${baseURL}${url}?${queryString}` : `${baseURL}${url}`;

  const retryConfig = buildRetryConfig(retry);

  let attempt = 0;

  while (true) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

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

      clearTimeout(timeoutId);

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
};

export default customInstance;
