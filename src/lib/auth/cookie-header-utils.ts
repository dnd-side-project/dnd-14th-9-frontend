import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "./cookie-constants";

import type { RefreshTokenPair } from "./token-refresh-utils";

export function parseCookieHeader(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};

  const entries = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const separatorIndex = part.indexOf("=");
      if (separatorIndex < 0) return null;

      const key = part.slice(0, separatorIndex).trim();
      const value = part.slice(separatorIndex + 1).trim();
      return key ? [key, value] : null;
    })
    .filter((entry): entry is [string, string] => entry !== null);

  return Object.fromEntries(entries);
}

export function buildCookieHeader(cookieMap: Record<string, string>): string {
  return Object.entries(cookieMap)
    .map(([key, value]) => `${key}=${value}`)
    .join("; ");
}

export function getCookieValue(cookieHeader: string | null, cookieName: string): string | null {
  const cookieMap = parseCookieHeader(cookieHeader);
  return cookieMap[cookieName] ?? null;
}

export function buildRefreshCookieHeader(refreshToken: string): string {
  return buildCookieHeader({
    [REFRESH_TOKEN_COOKIE]: refreshToken,
  });
}

export function mergeCookieHeaderWithAuthTokens(
  cookieHeader: string | null,
  tokens: RefreshTokenPair
): string | null {
  const cookieMap = parseCookieHeader(cookieHeader);
  cookieMap[ACCESS_TOKEN_COOKIE] = tokens.accessToken;
  cookieMap[REFRESH_TOKEN_COOKIE] = tokens.refreshToken;

  const merged = buildCookieHeader(cookieMap);
  return merged || null;
}
