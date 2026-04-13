import { cache } from "react";

import { memberKeys, memberQueries } from "@/features/member/hooks/useMemberHooks";
import { getQueryClient } from "@/lib/getQueryClient";

import { getServerAuthCookieState } from "./auth-cookie-state";
import {
  createAuthenticatedAuthState,
  createRecoveringAuthState,
  GUEST_AUTH_STATE,
  type AuthState,
} from "./auth-state";

import type { QueryClient } from "@tanstack/react-query";

type AuthResolverQueryClient = Pick<QueryClient, "fetchQuery" | "removeQueries">;

export async function resolveServerAuthStateWithQueryClient(
  queryClient: AuthResolverQueryClient
): Promise<AuthState> {
  const { hasAuthCookies } = await getServerAuthCookieState();

  if (!hasAuthCookies) {
    return GUEST_AUTH_STATE;
  }

  try {
    const response = await queryClient.fetchQuery(memberQueries.me());
    return createAuthenticatedAuthState(response.result);
  } catch {
    queryClient.removeQueries({ queryKey: memberKeys.me(), exact: true });
    return createRecoveringAuthState("me_fetch_failed");
  }
}

const resolveCachedServerAuthState = cache(async (): Promise<AuthState> => {
  return resolveServerAuthStateWithQueryClient(getQueryClient());
});

export async function resolveServerAuthState(): Promise<AuthState> {
  return resolveCachedServerAuthState();
}
