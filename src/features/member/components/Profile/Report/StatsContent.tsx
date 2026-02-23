import { memberApi } from "@/features/member/api";

import ActivitySummaryCard from "./ActivitySummaryCard";
import CategoryParticipationCard from "./CategoryParticipationCard";
import ReceivedEmojiCard from "./ReceivedEmojiCard";
import SessionPerformanceCard from "./SessionPerformanceCard";

export default async function StatsContent() {
  const data = await memberApi.getMyReportStats();

  if (!data?.result) {
    throw new Error("Failed to load report statistics");
  }

  const stats = data.result;

  return (
    <div className="gap-lg grid grid-cols-2">
      <ActivitySummaryCard data={stats.activitySummary} />
      <CategoryParticipationCard data={stats.categoryParticipation} />
      <ReceivedEmojiCard data={stats.receivedEmojis} />
      <SessionPerformanceCard data={stats.sessionPerformance} />
    </div>
  );
}
