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
      {/* 제목 섹션 */}
      <header className="mb-xl md:mb-2xl">
        <h1 className="text-lg leading-[140%] font-bold text-gray-50 md:text-2xl">세션 수정하기</h1>
        <p className="mt-2xs text-[13px] text-gray-500 md:text-base">세션 정보를 수정해보세요</p>
      </header>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <SessionEditContent sessionId={sessionId} />
      </HydrationBoundary>
    </main>
  );
}
