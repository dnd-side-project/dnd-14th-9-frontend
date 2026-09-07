import { Suspense } from "react";

import SessionHistoryContent from "@/features/member/components/Profile/Report/SessionHistoryContent";
import SessionHistorySkeleton from "@/features/member/components/Profile/Report/SessionHistorySkeleton";
import StatsContent from "@/features/member/components/Profile/Report/StatsContent";
import StatsSkeleton from "@/features/member/components/Profile/Report/StatsSkeleton";

export const metadata = { title: "기록 리포트" };

export default async function ProfileReportPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;

  return (
    <div className="gap-2xl md:gap-3xl flex flex-col lg:gap-20">
      <Suspense fallback={<StatsSkeleton />}>
        <StatsContent />
      </Suspense>

      <Suspense fallback={<SessionHistorySkeleton />}>
        <SessionHistoryContent page={page} />
      </Suspense>
    </div>
  );
}
