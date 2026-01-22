// Orval이 생성하는 API 호출에서 사용할 커스텀 fetch 인스턴스

type RequestConfig = {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  params?: Record<string, string>;
  data?: unknown;
  headers?: HeadersInit;
  signal?: AbortSignal;
};

export const customInstance = async <T>({
  url,
  method,
  params,
  data,
  headers,
  signal,
}: RequestConfig): Promise<T> => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL!;

  // URL 파라미터 처리
  const searchParams = new URLSearchParams(params);
  const queryString = searchParams.toString();
  const fullUrl = queryString ? `${baseURL}${url}?${queryString}` : `${baseURL}${url}`;

  const response = await fetch(fullUrl, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: data ? JSON.stringify(data) : undefined,
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export default customInstance;
