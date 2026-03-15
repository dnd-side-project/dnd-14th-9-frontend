import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "./cookie-constants";

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

export function getCallbackTokens(searchParams: URLSearchParams) {
  return {
    accessToken: searchParams.get(ACCESS_TOKEN_COOKIE),
    refreshToken: searchParams.get(REFRESH_TOKEN_COOKIE),
  };
}
