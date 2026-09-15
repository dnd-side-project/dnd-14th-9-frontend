import { cookies } from "next/headers";

import { getAccessTokenRefreshState } from "./access-token-state";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "./cookie-constants";

export interface ServerAuthCookieState {
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  hasAuthCookies: boolean;
  isAccessTokenUsable: boolean;
}

export async function getServerAuthCookieState(): Promise<ServerAuthCookieState> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const hasAccessToken = Boolean(accessToken);
  const hasRefreshToken = Boolean(cookieStore.get(REFRESH_TOKEN_COOKIE)?.value);

  return {
    hasAccessToken,
    hasRefreshToken,
    hasAuthCookies: hasAccessToken || hasRefreshToken,
    isAccessTokenUsable: accessToken
      ? getAccessTokenRefreshState(accessToken) !== "expired_or_invalid"
      : false,
  };
}
