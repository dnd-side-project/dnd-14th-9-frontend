import { BACKEND_ERROR_CODES, getApiErrorMessageByCode } from "@/lib/error/error-codes";
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

  switch (reason) {
    case BACKEND_ERROR_CODES.REFRESH_TOKEN_EXPIRED:
    case BACKEND_ERROR_CODES.NOT_FOUND_REFRESH_TOKEN:
    case BACKEND_ERROR_CODES.REFRESH_TOKEN_REQUIRED:
    case BACKEND_ERROR_CODES.REFRESH_TOKEN_MISMATCH:
      return "로그인 정보가 만료되었습니다. 다시 로그인해 주세요.";
    default:
      return getApiErrorMessageByCode(reason);
  }
}
