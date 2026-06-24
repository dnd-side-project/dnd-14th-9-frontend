import { memberKeys, memberQueries } from "@/features/member/hooks/useMemberHooks";

import { getServerAuthCookieState } from "./auth-cookie-state";

import type { QueryClient } from "@tanstack/react-query";

export async function prepareAuthMeQuery(queryClient: QueryClient) {
  const { hasAuthCookies } = await getServerAuthCookieState();
  const shouldUseMockAuth = process.env.NEXT_PUBLIC_USE_MOCK === "true";
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
