import { buildQueryString } from "@/lib/utils/url";

import { API_URL, type RetryOptions, type RequestMethod, executeFetch } from "./api-client";

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

export default customInstance;
