import { cookies } from "next/headers";

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "./cookie-constants";

export interface ServerAuthCookieState {
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  hasAuthCookies: boolean;
}

export async function getServerAuthCookieState(): Promise<ServerAuthCookieState> {
  const cookieStore = await cookies();
  const hasAccessToken = Boolean(cookieStore.get(ACCESS_TOKEN_COOKIE)?.value);
  const hasRefreshToken = Boolean(cookieStore.get(REFRESH_TOKEN_COOKIE)?.value);

  return {
    hasAccessToken,
    hasRefreshToken,
    hasAuthCookies: hasAccessToken || hasRefreshToken,
  };
}
