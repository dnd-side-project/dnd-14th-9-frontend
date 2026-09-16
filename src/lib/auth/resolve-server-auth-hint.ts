import { isMockModeEnabled } from "@/mocks/is-mock-mode-enabled";

import { getServerAuthCookieState } from "./auth-cookie-state";

export async function resolveServerAuthHint() {
  const { hasAuthCookies } = await getServerAuthCookieState();
  return { hasAuthCookies: hasAuthCookies || isMockModeEnabled() };
}
