import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { SessionEditContent } from "@/features/session/components/SessionEditContent";
import { sessionQueries } from "@/features/session/hooks/useSessionHooks";
import { getQueryClient } from "@/lib/getQueryClient";

export const metadata = { title: "세션 수정" };

interface SessionEditPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function SessionEditPage({ params }: SessionEditPageProps) {
  const { sessionId } = await params;
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(sessionQueries.detail(sessionId));

  return (
    <main className="p-md md:p-xl xl:p-3xl mx-auto w-full max-w-7xl">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <SessionEditContent sessionId={sessionId} />
      </HydrationBoundary>
    </main>
  );
}
