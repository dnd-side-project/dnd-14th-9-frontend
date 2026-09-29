"use client";

import { useMe } from "@/features/member/hooks/useMemberHooks";
import { isAuthRejectedError } from "@/lib/api/api-client";
import {
  createAuthenticatedAuthState,
  createRecoveringAuthState,
  GUEST_AUTH_STATE,
} from "@/lib/auth/auth-state";
import type { AuthState } from "@/lib/auth/auth-state";
import { isMockModeEnabled } from "@/mocks/is-mock-mode-enabled";

import { useHasAuthMarker } from "./useHasAuthMarker";

export function useAuthState(): AuthState {
  const hasAuthMarker = useHasAuthMarker();
  // mock 모드는 proxy·콜백을 거치지 않아 마커가 심기지 않으므로 항상 me를 조회한다.
  const canFetchMe = hasAuthMarker === true || isMockModeEnabled();
  const { data, isPending, isFetching, error, refetch } = useMe({ enabled: canFetchMe });

  // 비활성 쿼리는 isPending이 계속 true이므로 마커 판정을 먼저 반영한다.
  if (!canFetchMe) {
    return hasAuthMarker === null ? createRecoveringAuthState() : GUEST_AUTH_STATE;
  }
  if (isAuthRejectedError(error)) {
    return GUEST_AUTH_STATE;
  }
  if (data?.result) {
    return createAuthenticatedAuthState(data.result);
  }
  if (isPending || isFetching) {
    return createRecoveringAuthState();
  }
  // 조회가 끝났어도 인증 여부를 확인하지 못했다면 재시도를 제공한다.
  if (error) {
    return { status: "unavailable", retry: refetch };
  }
  return GUEST_AUTH_STATE;
}
