"use client";

import { useMe } from "@/features/member/hooks/useMemberHooks";
import type { MemberProfileView } from "@/features/member/types";
import { isMockModeEnabled } from "@/mocks/is-mock-mode-enabled";

import { useHasAuthMarker } from "./useHasAuthMarker";

export type AuthState =
  | { status: "guest" }
  | { status: "recovering" }
  | { status: "unavailable"; retry: () => void }
  | { status: "authenticated"; profile: MemberProfileView };

const GUEST_AUTH_STATE: AuthState = {
  status: "guest",
};

export function useAuthState(): AuthState {
  const hasAuthMarker = useHasAuthMarker();
  // mock 모드는 proxy·콜백을 거치지 않아 마커가 심기지 않으므로 항상 me를 조회한다.
  const canFetchMe = hasAuthMarker === true || isMockModeEnabled();
  const { data, isPending, isFetching, error, refetch } = useMe({ enabled: canFetchMe });

  // 비활성 쿼리는 isPending이 계속 true이므로 마커 판정을 먼저 반영한다.
  if (!canFetchMe) {
    return hasAuthMarker === null ? { status: "recovering" } : GUEST_AUTH_STATE;
  }
  // 인증 거부는 me 쿼리가 null로 해소하므로 data가 없으면 게스트로 귀결된다.
  if (data?.result) {
    return { status: "authenticated", profile: data.result };
  }
  if (isPending || isFetching) {
    return { status: "recovering" };
  }
  // 조회가 끝났어도 인증 여부를 확인하지 못했다면 재시도를 제공한다.
  if (error) {
    return { status: "unavailable", retry: refetch };
  }
  return GUEST_AUTH_STATE;
}
