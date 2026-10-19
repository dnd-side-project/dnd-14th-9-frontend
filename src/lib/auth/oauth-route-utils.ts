export function resolveBackendOrigin(): string | undefined {
  return (
    process.env.BACKEND_ORIGIN ??
    process.env.NEXT_PUBLIC_BACKEND_ORIGIN ??
    process.env.BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL
  );
}

export function buildProviderAuthorizationUrl(
  provider: string,
  backendOrigin: string,
  codeChallenge: string
): URL {
  const url = new URL(`/oauth2/authorization/${provider}`, backendOrigin);
  url.searchParams.set("codeChallenge", codeChallenge);

  return url;
}
