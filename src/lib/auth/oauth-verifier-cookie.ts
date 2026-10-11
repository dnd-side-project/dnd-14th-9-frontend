import type { NextResponse } from "next/server";

import {
  OAUTH_CODE_VERIFIER_COOKIE,
  OAUTH_CODE_VERIFIER_COOKIE_PATH,
  OAUTH_CODE_VERIFIER_MAX_AGE_SECONDS,
} from "./cookie-constants";

interface CookieStore {
  get: (name: string) => { value: string } | undefined;
  delete: (options: { name: string; path: string }) => void;
}

export function setOAuthCodeVerifierCookie(response: NextResponse, verifier: string) {
  response.cookies.set(OAUTH_CODE_VERIFIER_COOKIE, verifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: OAUTH_CODE_VERIFIER_COOKIE_PATH,
    maxAge: OAUTH_CODE_VERIFIER_MAX_AGE_SECONDS,
  });
}

/**
 * verifier를 읽으면서 바로 지운다. 이번 로그인 시도에서만 쓰는 값이기 때문이다.
 *
 * Path가 `/`가 아니므로 이름만으로는 지워지지 않는다. 발급할 때와 같은 path를 지정한다.
 */
export function takeOAuthCodeVerifier(cookieStore: CookieStore): string | undefined {
  const verifier = cookieStore.get(OAUTH_CODE_VERIFIER_COOKIE)?.value;
  cookieStore.delete({ name: OAUTH_CODE_VERIFIER_COOKIE, path: OAUTH_CODE_VERIFIER_COOKIE_PATH });

  return verifier;
}
