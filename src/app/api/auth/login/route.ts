import { NextRequest, NextResponse } from "next/server";

import {
  buildProviderAuthorizationUrl,
  redirectToLogin,
  resolveBackendOrigin,
  setRedirectAfterLoginCookie,
} from "@/lib/auth/auth-route-utils";
import { isLoginProvider } from "@/lib/auth/login-policy";

export async function GET(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get("provider");
  const nextPath = request.nextUrl.searchParams.get("next");

  if (!isLoginProvider(provider)) {
    return redirectToLogin(request, "access_denied");
  }

  const backendOrigin = resolveBackendOrigin();

  if (!backendOrigin) {
    return redirectToLogin(request, "config_error");
  }

  const response = NextResponse.redirect(buildProviderAuthorizationUrl(provider, backendOrigin));

  setRedirectAfterLoginCookie(response, nextPath);

  return response;
}
