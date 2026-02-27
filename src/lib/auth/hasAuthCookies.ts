import { cookies } from "next/headers";

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "./cookie-constants";

export async function hasAuthCookies(): Promise<boolean> {
  const cookieStore = await cookies();
  return Boolean(
    cookieStore.get(ACCESS_TOKEN_COOKIE)?.value || cookieStore.get(REFRESH_TOKEN_COOKIE)?.value
  );
}
