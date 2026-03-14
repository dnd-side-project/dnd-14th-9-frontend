import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function buildLoginRedirectUrl(request: NextRequest, reason: string): URL {
  const url = new URL("/login", request.url);
  url.searchParams.set("reason", reason);
  return url;
}

export function redirectToLogin(request: NextRequest, reason: string): NextResponse {
  return NextResponse.redirect(buildLoginRedirectUrl(request, reason));
}
