import type { NextResponse } from "next/server";

import {
  REDIRECT_AFTER_LOGIN_COOKIE,
  REDIRECT_AFTER_LOGIN_MAX_AGE_SECONDS,
} from "./cookie-constants";
import { normalizeInternalPath } from "./login-page-policy";

interface CookieReader {
  get: (name: string) => { value: string } | undefined;
}

interface CookieWriter {
  delete: (name: string) => void;
}

export function setRedirectAfterLoginCookie(
  response: NextResponse,
  nextPath: string | null | undefined
) {
  response.cookies.set(REDIRECT_AFTER_LOGIN_COOKIE, normalizeInternalPath(nextPath), {
    path: "/",
    maxAge: REDIRECT_AFTER_LOGIN_MAX_AGE_SECONDS,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export function getRedirectAfterLoginPath(cookieReader: CookieReader): string {
  return normalizeInternalPath(cookieReader.get(REDIRECT_AFTER_LOGIN_COOKIE)?.value);
}

export function consumeRedirectAfterLoginCookie(cookieWriter: CookieWriter) {
  cookieWriter.delete(REDIRECT_AFTER_LOGIN_COOKIE);
}
