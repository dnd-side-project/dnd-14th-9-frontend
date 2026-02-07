export const ACCESS_TOKEN_COOKIE = "accessToken";
export const REFRESH_TOKEN_COOKIE = "refreshToken";
export const REDIRECT_AFTER_LOGIN_COOKIE = "redirectAfterLogin";
export const LOGIN_REQUIRED_COOKIE = "loginRequired";
export const LOGIN_ERROR_COOKIE = "loginError";
export const LOGIN_SIGNAL_MAX_AGE_SECONDS = 60;

const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 60;
const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
export const REDIRECT_AFTER_LOGIN_MAX_AGE_SECONDS = 60 * 5;

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

interface LoginSignalOptions {
  error?: string;
  redirectPath?: string;
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

export function setLoginSignalCookies(
  writer: CookieWriter,
  options: LoginSignalOptions,
  isProduction: boolean = process.env.NODE_ENV === "production"
) {
  const baseOptions = {
    httpOnly: false,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  } as const;

  writer.set(LOGIN_REQUIRED_COOKIE, "1", {
    ...baseOptions,
    maxAge: LOGIN_SIGNAL_MAX_AGE_SECONDS,
  });

  if (options.error) {
    writer.set(LOGIN_ERROR_COOKIE, options.error, {
      ...baseOptions,
      maxAge: LOGIN_SIGNAL_MAX_AGE_SECONDS,
    });
  }

  if (options.redirectPath) {
    writer.set(REDIRECT_AFTER_LOGIN_COOKIE, options.redirectPath, {
      ...baseOptions,
      maxAge: REDIRECT_AFTER_LOGIN_MAX_AGE_SECONDS,
    });
  }
}

export function clearLoginSignalCookies(writer: CookieWriter) {
  writer.delete(LOGIN_REQUIRED_COOKIE);
  writer.delete(LOGIN_ERROR_COOKIE);
}
