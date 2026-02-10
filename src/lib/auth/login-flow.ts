export type LoginProvider = "google" | "kakao";

const LOGIN_PROVIDERS: ReadonlySet<LoginProvider> = new Set(["google", "kakao"]);

export function isLoginProvider(value: string | null | undefined): value is LoginProvider {
  if (!value) return false;
  return LOGIN_PROVIDERS.has(value as LoginProvider);
}

export function normalizeInternalPath(path: string | null | undefined): string {
  if (!path) return "/";
  if (!path.startsWith("/") || path.startsWith("//")) return "/";
  if (path === "/login" || path.startsWith("/login?")) return "/";
  return path;
}
