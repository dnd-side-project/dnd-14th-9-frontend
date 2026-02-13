import { NextRequest, NextResponse } from "next/server";

import {
  buildProviderAuthorizationUrl,
  redirectToLogin,
  resolveBackendOrigin,
  setRedirectAfterLoginCookie,
} from "@/lib/auth/auth-route-utils";
import { isLoginProvider } from "@/lib/auth/login-policy";
import { BACKEND_ERROR_CODES, LOGIN_INTERNAL_ERROR_CODES } from "@/lib/error/error-codes";

export async function GET(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get("provider");
  const nextPath = request.nextUrl.searchParams.get("next");

  if (!isLoginProvider(provider)) {
    return redirectToLogin(request, BACKEND_ERROR_CODES.OAUTH2_UNSUPPORTED_PROVIDER);
  }

  const backendOrigin = resolveBackendOrigin();

  if (!backendOrigin) {
    return redirectToLogin(request, LOGIN_INTERNAL_ERROR_CODES.CONFIG_ERROR);
  }

  const response = NextResponse.redirect(buildProviderAuthorizationUrl(provider, backendOrigin));

  setRedirectAfterLoginCookie(response, nextPath);

  return response;
}
