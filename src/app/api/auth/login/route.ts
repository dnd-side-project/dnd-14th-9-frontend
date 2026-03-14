import { NextRequest, NextResponse } from "next/server";

import { redirectToLogin } from "@/lib/auth/login-redirect-utils";
import { isLoginProvider } from "@/lib/auth/oauth-provider-policy";
import { buildProviderAuthorizationUrl, resolveBackendOrigin } from "@/lib/auth/oauth-route-utils";
import { setRedirectAfterLoginCookie } from "@/lib/auth/redirect-after-login-cookie";
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
