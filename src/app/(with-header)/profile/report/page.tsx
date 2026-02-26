import { Suspense } from "react";

import SessionHistoryContent from "@/features/member/components/Profile/Report/SessionHistoryContent";
import SessionHistorySkeleton from "@/features/member/components/Profile/Report/SessionHistorySkeleton";
import StatsContent from "@/features/member/components/Profile/Report/StatsContent";
import StatsSkeleton from "@/features/member/components/Profile/Report/StatsSkeleton";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "기록 리포트",
  description: "나의 활동 통계와 세션 참여 기록을 확인하세요.",
  noIndex: true,
});

export default async function ProfileReportPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;

  return (
    <div className="flex flex-col gap-20">
      <Suspense fallback={<StatsSkeleton />}>
        <StatsContent />
      </Suspense>

      <Suspense fallback={<SessionHistorySkeleton />}>
        <SessionHistoryContent page={page} />
      </Suspense>
    </div>
  );
}
