import { memberKeys, memberQueries } from "@/features/member/hooks/useMemberHooks";
import { isMockModeEnabled } from "@/mocks/is-mock-mode-enabled";

import { getServerAuthCookieState } from "./auth-cookie-state";

import type { QueryClient } from "@tanstack/react-query";

export async function prepareAuthMeQuery(queryClient: QueryClient) {
  const { hasAuthCookies, isAccessTokenUsable } = await getServerAuthCookieState();
  const shouldUseMockAuth = isMockModeEnabled();
  const effectiveHasAuthCookies = hasAuthCookies || shouldUseMockAuth;

  if (!effectiveHasAuthCookies) {
    return { hasAuthCookies: false };
  }

  // Access Token이 만료/부재한 상태에서 SSR이 me를 prefetch하면, 이 prefetch가 서버 내부 API
  // 호출로 이어져 Refresh Token 회전을 소모한다. 그 결과로 발급되는 새 쿠키는 Server Component
  // 응답에 실을 수 없어 브라우저에 전달되지 않으므로, 회전 전 토큰이 무효화된 채로 남는다.
  // 이를 피하기 위해 Access Token이 아직 사용 가능한 경우에만 prefetch하고, 그렇지 않으면
  // 브라우저에서 실행되는 useMe가 직접 갱신하도록 넘긴다(그 Set-Cookie는 브라우저에 도달한다).
  if (shouldUseMockAuth || isAccessTokenUsable) {
    try {
      await queryClient.fetchQuery(memberQueries.me());
    } catch {
      queryClient.removeQueries({ queryKey: memberKeys.me(), exact: true });
    }
  }

  return { hasAuthCookies: effectiveHasAuthCookies };
}
