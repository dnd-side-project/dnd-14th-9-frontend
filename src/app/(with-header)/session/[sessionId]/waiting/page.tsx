import { redirect } from "next/navigation";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { WaitingRoomContent } from "@/features/lobby/components/WaitingRoomContent";
import { sessionQueries } from "@/features/session/hooks/useSessionHooks";
import { isInProgressStatus } from "@/features/session/types";
import { hasAuthCookies } from "@/lib/auth/hasAuthCookies";
import { getQueryClient } from "@/lib/getQueryClient";

export const metadata = { title: "대기실" };

interface WaitingRoomPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function WaitingRoomPage({ params }: WaitingRoomPageProps) {
  const { sessionId } = await params;
  const queryClient = getQueryClient();

  const sessionData = await queryClient.fetchQuery(sessionQueries.detail(sessionId));

  // 이미 진행 중인 세션이면 대기실을 거치지 않고 바로 세션 페이지로 이동
  if (isInProgressStatus(sessionData.result.status)) {
    redirect(`/session/${sessionId}`);
  }

  if (await hasAuthCookies()) {
    await queryClient.prefetchQuery(sessionQueries.waitingRoom(sessionId));
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WaitingRoomContent sessionId={sessionId} />
    </HydrationBoundary>
  );
}
