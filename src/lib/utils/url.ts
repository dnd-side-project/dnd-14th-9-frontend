export function getSessionShareUrl(sessionId: string): string {
  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL;

  return `${baseUrl}/session/${sessionId}`;
}

export function buildQueryString(
  params: Record<string, string | number | boolean | undefined | null>
): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query;
}

export function parseQueryString<T extends Record<string, string>>(search: string): Partial<T> {
  const params = new URLSearchParams(search);
  return Object.fromEntries(params.entries()) as Partial<T>;
}
