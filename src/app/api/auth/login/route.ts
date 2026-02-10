import { NextRequest, NextResponse } from "next/server";
import { isLoginProvider, normalizeInternalPath } from "@/lib/auth/login-flow";
import {
  REDIRECT_AFTER_LOGIN_COOKIE,
  REDIRECT_AFTER_LOGIN_MAX_AGE_SECONDS,
} from "@/lib/auth/cookie-constants";

function buildLoginRedirectUrl(request: NextRequest, reason: string): URL {
  const url = new URL("/login", request.url);
  url.searchParams.set("reason", reason);
  return url;
}

function resolveBackendOrigin(): string | undefined {
  return (
    process.env.BACKEND_ORIGIN ??
    process.env.NEXT_PUBLIC_BACKEND_ORIGIN ??
    process.env.BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL
  );
}

export async function GET(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get("provider");
  const nextPath = request.nextUrl.searchParams.get("next");

  if (!isLoginProvider(provider)) {
    return NextResponse.redirect(buildLoginRedirectUrl(request, "access_denied"));
  }

  const backendOrigin = resolveBackendOrigin();
  if (!backendOrigin) {
    return NextResponse.redirect(buildLoginRedirectUrl(request, "config_error"));
  }

  const response = NextResponse.redirect(
    new URL(`/oauth2/authorization/${provider}`, backendOrigin)
  );

  response.cookies.set(REDIRECT_AFTER_LOGIN_COOKIE, normalizeInternalPath(nextPath), {
    path: "/",
    maxAge: REDIRECT_AFTER_LOGIN_MAX_AGE_SECONDS,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
