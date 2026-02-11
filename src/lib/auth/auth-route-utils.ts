import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  ACCESS_TOKEN_COOKIE,
  REDIRECT_AFTER_LOGIN_COOKIE,
  REDIRECT_AFTER_LOGIN_MAX_AGE_SECONDS,
  REFRESH_TOKEN_COOKIE,
} from "./cookie-constants";
import { normalizeInternalPath } from "./login-policy";

interface CookieReader {
  get: (name: string) => { value: string } | undefined;
}

interface CookieWriter {
  delete: (name: string) => void;
}

export function buildLoginRedirectUrl(request: NextRequest, reason: string): URL {
  const url = new URL("/login", request.url);
  url.searchParams.set("reason", reason);
  return url;
}

export function redirectToLogin(request: NextRequest, reason: string): NextResponse {
  return NextResponse.redirect(buildLoginRedirectUrl(request, reason));
}

export function resolveBackendOrigin(): string | undefined {
  return (
    process.env.BACKEND_ORIGIN ??
    process.env.NEXT_PUBLIC_BACKEND_ORIGIN ??
    process.env.BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL
  );
}

export function buildProviderAuthorizationUrl(provider: string, backendOrigin: string): URL {
  return new URL(`/oauth2/authorization/${provider}`, backendOrigin);
}

export function setRedirectAfterLoginCookie(
  response: NextResponse,
  nextPath: string | null | undefined
) {
  response.cookies.set(REDIRECT_AFTER_LOGIN_COOKIE, normalizeInternalPath(nextPath), {
    path: "/",
    maxAge: REDIRECT_AFTER_LOGIN_MAX_AGE_SECONDS,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export function getRedirectAfterLoginPath(cookieReader: CookieReader): string {
  return normalizeInternalPath(cookieReader.get(REDIRECT_AFTER_LOGIN_COOKIE)?.value);
}

export function consumeRedirectAfterLoginCookie(cookieWriter: CookieWriter) {
  cookieWriter.delete(REDIRECT_AFTER_LOGIN_COOKIE);
}

export function getCallbackTokens(searchParams: URLSearchParams) {
  return {
    accessToken: searchParams.get(ACCESS_TOKEN_COOKIE),
    refreshToken: searchParams.get(REFRESH_TOKEN_COOKIE),
  };
}
