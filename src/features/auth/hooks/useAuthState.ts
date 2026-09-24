"use client";

import { useMe } from "@/features/member/hooks/useMemberHooks";
import { isAuthRejectedError } from "@/lib/api/api-client";
import {
  createAuthenticatedAuthState,
  createRecoveringAuthState,
  GUEST_AUTH_STATE,
} from "@/lib/auth/auth-state";
import { isMockModeEnabled } from "@/mocks/is-mock-mode-enabled";

import { useHasAuthMarker } from "./useHasAuthMarker";

export function useAuthState() {
  const hasAuthMarker = useHasAuthMarker();
  // mock 모드는 proxy·콜백을 거치지 않아 마커가 심기지 않으므로 항상 me를 조회한다.
  const canFetchMe = hasAuthMarker === true || isMockModeEnabled();
  const { data, isPending, isFetching, error } = useMe({ enabled: canFetchMe });

  if (data?.result) {
    return createAuthenticatedAuthState(data.result);
  }
  // 비활성 쿼리는 isPending이 계속 true이므로 마커 판정을 먼저 반영한다.
  if (!canFetchMe) {
    return hasAuthMarker === null ? createRecoveringAuthState() : GUEST_AUTH_STATE;
  }
  if (isPending || isFetching) {
    return createRecoveringAuthState();
  }
  // 일시 실패(5xx·네트워크)는 인증 여부를 확인하지 못한 것이므로 로그아웃으로 오인하지 않게 guest로 떨어뜨리지 않는다.
  if (error && !isAuthRejectedError(error)) {
    return createRecoveringAuthState();
  }
  return GUEST_AUTH_STATE;
}
