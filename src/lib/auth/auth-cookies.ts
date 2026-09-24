import {
  ACCESS_TOKEN_COOKIE,
  AUTH_MARKER_COOKIE,
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
} from "./cookie-constants";

type SameSite = "strict" | "lax" | "none";

interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: SameSite;
  maxAge: number;
  path: string;
}

interface CookieWriter {
  set: (name: string, value: string, options: CookieOptions) => void;
  delete: (name: string) => void;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

function getBaseCookieOptions(isProduction: boolean): Omit<CookieOptions, "maxAge"> {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  };
}

export function setAuthCookies(
  writer: CookieWriter,
  tokens: AuthTokens,
  isProduction: boolean = process.env.NODE_ENV === "production"
) {
  const baseOptions = getBaseCookieOptions(isProduction);

  writer.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...baseOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
  });

  writer.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...baseOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
  });

  setAuthMarkerCookie(writer, isProduction);
}

/**
 * 비로그인 사용자가 /me를 호출하지 않도록 클라이언트가 읽는 마커를 심는다. Refresh Token과 수명을 맞춘다.
 */
export function setAuthMarkerCookie(
  writer: CookieWriter,
  isProduction: boolean = process.env.NODE_ENV === "production"
) {
  writer.set(AUTH_MARKER_COOKIE, "1", {
    ...getBaseCookieOptions(isProduction),
    httpOnly: false,
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
  });
}

export function clearAuthCookies(writer: CookieWriter) {
  writer.delete(ACCESS_TOKEN_COOKIE);
  writer.delete(REFRESH_TOKEN_COOKIE);
  writer.delete(AUTH_MARKER_COOKIE);
}
