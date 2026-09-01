const SENSITIVE_QUERY_KEYS = [
  "token",
  "access_token",
  "refresh_token",
  "accesstoken",
  "refreshtoken",
  "authorization",
  "auth",
  "cookie",
  "email",
  "phone",
  "code",
  "state",
];

export function sanitizePath(rawUrl: string, backendApiBase?: string): string {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    try {
      parsed = new URL(rawUrl, "http://local.invalid");
    } catch {
      return "/unknown";
    }
  }

  const params = new URLSearchParams(parsed.search);
  for (const key of [...params.keys()]) {
    if (SENSITIVE_QUERY_KEYS.some((sensitive) => key.toLowerCase().includes(sensitive))) {
      params.set(key, "[redacted]");
    }
  }

  const search = params.toString();
  let pathname = parsed.pathname || "/";

  if (backendApiBase) {
    try {
      const backend = new URL(backendApiBase);
      if (parsed.origin === backend.origin && pathname.startsWith(backend.pathname)) {
        const stripped = pathname.slice(backend.pathname.length);
        pathname = stripped.startsWith("/") ? stripped : `/${stripped}`;
        if (pathname === "") pathname = "/";
      }
    } catch {
      // keep pathname
    }
  }

  return search ? `${pathname}?${search}` : pathname;
}

export function getUrlOrigin(rawUrl: string): string | null {
  try {
    return new URL(rawUrl).origin;
  } catch {
    return null;
  }
}
