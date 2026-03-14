import { getApiErrorMessageByCode } from "@/lib/error/error-codes";

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
