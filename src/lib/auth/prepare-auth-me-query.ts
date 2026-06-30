import { memberKeys, memberQueries } from "@/features/member/hooks/useMemberHooks";
import { isMockModeEnabled } from "@/mocks/is-mock-mode-enabled";

import { getServerAuthCookieState } from "./auth-cookie-state";

import type { QueryClient } from "@tanstack/react-query";

export async function prepareAuthMeQuery(queryClient: QueryClient) {
  const { hasAuthCookies } = await getServerAuthCookieState();
  const shouldUseMockAuth = isMockModeEnabled();
  const effectiveHasAuthCookies = hasAuthCookies || shouldUseMockAuth;

  if (!effectiveHasAuthCookies) {
    return { hasAuthCookies: false };
  }

  try {
    await queryClient.fetchQuery(memberQueries.me());
  } catch {
    queryClient.removeQueries({ queryKey: memberKeys.me(), exact: true });
  }

  return { hasAuthCookies: effectiveHasAuthCookies };
}
