import { getApiErrorMessageByCode } from "@/lib/error/error-codes";
import { LOGIN_ROUTE, ROOT_ROUTE } from "@/lib/routes/route-paths";

export function normalizeInternalPath(path: string | null | undefined): string {
  if (!path) return ROOT_ROUTE;
  if (!path.startsWith(ROOT_ROUTE) || path.startsWith("//")) return ROOT_ROUTE;
  if (path === LOGIN_ROUTE || path.startsWith(`${LOGIN_ROUTE}?`)) return ROOT_ROUTE;
  if (path === "/api" || path.startsWith("/api/")) return ROOT_ROUTE;
  return path;
}

export function getLoginReasonMessage(reason: string | null | undefined): string | null {
  if (!reason) return null;
  return getApiErrorMessageByCode(reason);
}
