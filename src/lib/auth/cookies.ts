const ACCESS_TOKEN_COOKIE = "accessToken";
const REFRESH_TOKEN_COOKIE = "refreshToken";

const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 60;
const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

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
}

export function clearAuthCookies(writer: CookieWriter) {
  writer.delete(ACCESS_TOKEN_COOKIE);
  writer.delete(REFRESH_TOKEN_COOKIE);
}
