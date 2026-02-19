import { getApiErrorMessageByCode } from "@/lib/error/error-codes";

export const LOGIN_PROVIDERS = ["google", "kakao"] as const;
export type LoginProvider = (typeof LOGIN_PROVIDERS)[number];

export function isLoginProvider(value: string | null | undefined): value is LoginProvider {
  if (!value) return false;
  return LOGIN_PROVIDERS.includes(value as LoginProvider);
}

export function normalizeInternalPath(path: string | null | undefined): string {
  if (!path) return "/";
  if (!path.startsWith("/") || path.startsWith("//")) return "/";
  if (path === "/login" || path.startsWith("/login?")) return "/";
  if (path === "/api" || path.startsWith("/api/")) return "/";
  return path;
}

export function getLoginReasonMessage(reason: string | null | undefined): string | null {
  if (!reason) return null;
  return getApiErrorMessageByCode(reason);
}
