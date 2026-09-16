"use client";

import { useMe } from "@/features/member/hooks/useMemberHooks";
import {
  createAuthenticatedAuthState,
  createRecoveringAuthState,
  GUEST_AUTH_STATE,
} from "@/lib/auth/auth-state";

export function useAuthState() {
  const { data, isPending } = useMe();

  if (data?.result) {
    return createAuthenticatedAuthState(data.result);
  }
  if (isPending) {
    return createRecoveringAuthState();
  }
  return GUEST_AUTH_STATE;
}
