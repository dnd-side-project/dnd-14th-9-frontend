"use client";

import { useMemo } from "react";

import { useMe } from "@/features/member/hooks/useMemberHooks";
import {
  createAuthenticatedAuthState,
  createRecoveringAuthState,
  GUEST_AUTH_STATE,
} from "@/lib/auth/auth-state";
import { useAuthHint } from "@/providers/AuthStateProvider";

export function useAuthState() {
  const hasAuthCookies = useAuthHint();
  const { data, isLoading, isFetching, isError } = useMe({ enabled: hasAuthCookies });

  return useMemo(() => {
    if (!hasAuthCookies) {
      return GUEST_AUTH_STATE;
    }

    if (data?.result) {
      return createAuthenticatedAuthState(data.result);
    }

    if (isLoading || isFetching) {
      return createRecoveringAuthState();
    }

    if (isError) {
      return GUEST_AUTH_STATE;
    }

    return createRecoveringAuthState();
  }, [data, hasAuthCookies, isError, isFetching, isLoading]);
}
