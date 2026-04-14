import { memberKeys, memberQueries } from "@/features/member/hooks/useMemberHooks";

import { getServerAuthCookieState } from "./auth-cookie-state";

import type { QueryClient } from "@tanstack/react-query";

export async function prepareAuthMeQuery(queryClient: QueryClient) {
  const { hasAuthCookies } = await getServerAuthCookieState();

  if (!hasAuthCookies) {
    return { hasAuthCookies };
  }

  try {
    await queryClient.fetchQuery(memberQueries.me());
  } catch {
    queryClient.removeQueries({ queryKey: memberKeys.me(), exact: true });
  }

  return { hasAuthCookies };
}
