import { Suspense } from "react";

import { ParticipantsReportContent } from "@/features/session/components/SessionResult/ParticipantsReportContent";
import { SessionResultHeader } from "@/features/session/components/SessionResult/SessionResultHeader";
import { SessionResultSkeleton } from "@/features/session/components/SessionResult/SessionResultSkeleton";

export default async function ParticipantsReportPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  return (
    <div className="gap-lg p-3xl flex flex-col">
      <SessionResultHeader />
      <Suspense fallback={<SessionResultSkeleton />}>
        <ParticipantsReportContent sessionId={sessionId} />
      </Suspense>
    </div>
  );
}
