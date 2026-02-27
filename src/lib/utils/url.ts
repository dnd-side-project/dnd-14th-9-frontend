import { encodeBase62 } from "./base62";

export function getSessionShareUrl(sessionId: number): string {
  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL;

  const code = encodeBase62(sessionId);
  return `${baseUrl}/s/${code}`;
}

type QueryParamValue = string | number | boolean | undefined | null;
export type QueryParams = Record<string, QueryParamValue | QueryParamValue[]>;

export function buildQueryString(params: QueryParams): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value == null || value === "") {
      return;
    }

    if (Array.isArray(value)) {
      const filtered = value.filter((v) => v != null && v !== "");
      if (filtered.length > 0) {
        searchParams.set(key, filtered.map(String).join(","));
      }
    } else {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function parseQueryString<T extends Record<string, string>>(search: string): Partial<T> {
  const params = new URLSearchParams(search);
  return Object.fromEntries(params.entries()) as Partial<T>;
}
