interface UnhandledRequestLike {
  url: string;
  method: string;
}

export function isUnhandledBackendApiRequest(request: UnhandledRequestLike): boolean {
  const { pathname } = new URL(request.url);
  return pathname === "/api" || pathname.startsWith("/api/");
}

export function strictUnhandledApiRequest(request: UnhandledRequestLike): void {
  if (!isUnhandledBackendApiRequest(request)) return;

  throw new Error(`[MSW] Unhandled backend API request: ${request.method} ${request.url}`);
}
