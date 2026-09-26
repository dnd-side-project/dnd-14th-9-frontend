import { redirect } from "next/navigation";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { WaitingRoomContent } from "@/features/lobby/components/WaitingRoomContent";
import { memberKeys } from "@/features/member/hooks/useMemberHooks";
import type { GetMeResponse } from "@/features/member/types";
import { sessionQueries } from "@/features/session/hooks/useSessionHooks";
import { sessionServerApi } from "@/features/session/server/api";
import { getSessionDetail } from "@/features/session/server/get-session-detail";
import { isInProgressStatus } from "@/features/session/types";
import { handleSessionNotFound } from "@/features/session/utils/handleSessionNotFound";
import { getQueryClient } from "@/lib/getQueryClient";
import { isMockModeEnabled } from "@/mocks/is-mock-mode-enabled";

export const metadata = { title: "대기실" };

interface WaitingRoomPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function WaitingRoomPage({ params }: WaitingRoomPageProps) {
  const { sessionId } = await params;
  const queryClient = getQueryClient();

  const sessionData = await queryClient
    .fetchQuery({
      ...sessionQueries.detail(sessionId),
      queryFn: () => getSessionDetail(sessionId),
    })
    .catch(handleSessionNotFound);

  // mock mode에서는 UI 확인을 위해 대기방 화면에 직접 접근할 수 있도록 상태 기반 redirect를 제한한다.
  if (!isMockModeEnabled() && isInProgressStatus(sessionData.result.status)) {
    redirect(`/session/${sessionId}`);
  }

  const meData = queryClient.getQueryData<GetMeResponse>(memberKeys.me());
  if (meData?.result) {
    await queryClient.prefetchQuery({
      ...sessionQueries.waitingRoom(sessionId),
      queryFn: () => sessionServerApi.getWaitingRoom(sessionId),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WaitingRoomContent sessionId={sessionId} />
    </HydrationBoundary>
  );
}
