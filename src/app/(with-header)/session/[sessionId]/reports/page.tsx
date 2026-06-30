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
    <div className="gap-lg px-lg py-lg md:py-3xl flex flex-col md:px-13.5">
      <SessionResultHeader />
      <Suspense fallback={<SessionResultSkeleton />}>
        <ParticipantsReportContent sessionId={sessionId} />
      </Suspense>
    </div>
  );
}
