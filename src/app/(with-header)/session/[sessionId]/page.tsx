import type { Metadata } from "next";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { sessionApi } from "@/features/session/api";
import { SessionPageContent } from "@/features/session/components/SessionPageContent";
import { sessionQueries } from "@/features/session/hooks/useSessionHooks";
import { isWaitingStatus } from "@/features/session/types";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth/cookie-constants";
import { getQueryClient } from "@/lib/getQueryClient";
import { createPageMetadata } from "@/lib/seo/metadata";

interface SessionPageProps {
  params: Promise<{ sessionId: string }>;
}

export async function generateMetadata({ params }: SessionPageProps): Promise<Metadata> {
  const { sessionId } = await params;

  try {
    const { result } = await sessionApi.getDetail(sessionId);
    return createPageMetadata({
      title: result.title,
      description: result.summary || `${result.category} 세션에 참여하세요.`,
      pathname: `/session/${sessionId}`,
      openGraph: {
        images: result.imageUrl ? [{ url: result.imageUrl }] : undefined,
      },
    });
  } catch {
    return createPageMetadata({
      title: "세션 상세",
      description: "모각작 세션 정보를 확인하세요.",
    });
  }
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { sessionId } = await params;
  const queryClient = getQueryClient();

  const sessionData = await queryClient.fetchQuery(sessionQueries.detail(sessionId));

  // 대기 중인 세션이면 대기실로 리다이렉트
  if (isWaitingStatus(sessionData.result.status)) {
    redirect(`/session/${sessionId}/waiting`);
  }

  const cookieStore = await cookies();
  const hasAuthCookie = Boolean(
    cookieStore.get(ACCESS_TOKEN_COOKIE)?.value || cookieStore.get(REFRESH_TOKEN_COOKIE)?.value
  );

  if (hasAuthCookie) {
    await queryClient.prefetchQuery(sessionQueries.waitingRoom(sessionId));
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SessionPageContent sessionId={sessionId} />
    </HydrationBoundary>
  );
}
