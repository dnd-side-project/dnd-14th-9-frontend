import { Suspense } from "react";

import SessionHistoryContent from "@/features/member/components/Profile/Report/SessionHistoryContent";
import SessionHistorySkeleton from "@/features/member/components/Profile/Report/SessionHistorySkeleton";
import StatsContent from "@/features/member/components/Profile/Report/StatsContent";
import StatsSkeleton from "@/features/member/components/Profile/Report/StatsSkeleton";

export default function ProfileReportPage({ searchParams }: { searchParams: { page?: string } }) {
  const page = Number(searchParams.page) || 1;

  return (
    <div className="flex flex-col gap-[80px]">
      <Suspense fallback={<StatsSkeleton />}>
        <StatsContent />
      </Suspense>

      <Suspense fallback={<SessionHistorySkeleton />}>
        <SessionHistoryContent page={page} />
      </Suspense>
    </div>
  );
}
