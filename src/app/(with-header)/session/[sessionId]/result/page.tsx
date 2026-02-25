import { Suspense } from "react";

import { SessionResultContent } from "@/features/session/components/SessionResult/SessionResultContent";
import { SessionResultHeader } from "@/features/session/components/SessionResult/SessionResultHeader";
import { SessionResultSkeleton } from "@/features/session/components/SessionResult/SessionResultSkeleton";

export default async function SessionResultPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  return (
    <div className="gap-lg p-3xl flex flex-col">
      <SessionResultHeader />
      <Suspense fallback={<SessionResultSkeleton />}>
        <SessionResultContent sessionId={sessionId} />
      </Suspense>
    </div>
  );
}
