import { API_URL, type RetryOptions, type RequestMethod, executeFetch } from "./api-client";
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

const apiRequest = async <T>({
  url,
  method,
  params,
  data,
  headers,
  signal,
  timeout,
  retry,
}: RequestConfig): Promise<T> => {
  const baseURL = API_URL!;

  const queryString = params ? buildQueryString(params) : "";
  const fullUrl = queryString ? `${baseURL}${url}?${queryString}` : `${baseURL}${url}`;

  return executeFetch<T>(
    method,
    fullUrl,
    {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    },
    {
      timeout,
      retry,
      signal,
    }
  );
};

// orval용 어댑터 - (url, options) 시그니처를 기존 apiRequest로 변환
export const customInstance = async <T>(url: string, options?: RequestInit): Promise<T> => {
  return apiRequest<T>({
    url,
    method: (options?.method ?? "GET") as RequestMethod,
    data: options?.body ? JSON.parse(options.body as string) : undefined,
    headers: options?.headers as HeadersInit,
    signal: options?.signal ?? undefined,
  });
};

export { apiRequest };
