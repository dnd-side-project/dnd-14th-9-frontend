import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { LOGIN_ROUTE } from "@/lib/routes/route-paths";

export function buildLoginRedirectUrl(request: NextRequest, reason: string): URL {
  const url = new URL(LOGIN_ROUTE, request.url);
  url.searchParams.set("reason", reason);
  return url;
}

export function redirectToLogin(request: NextRequest, reason: string): NextResponse {
  return NextResponse.redirect(buildLoginRedirectUrl(request, reason));
}
