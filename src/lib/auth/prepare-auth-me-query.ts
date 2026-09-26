import { memberKeys, memberQueries } from "@/features/member/hooks/useMemberHooks";
import { memberServerApi } from "@/features/member/server/api";
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
    await queryClient.fetchQuery({
      ...memberQueries.me(),
      queryFn: () => memberServerApi.getMe(),
    });
  } catch {
    queryClient.removeQueries({ queryKey: memberKeys.me(), exact: true });
  }

  return { hasAuthCookies: effectiveHasAuthCookies };
}
