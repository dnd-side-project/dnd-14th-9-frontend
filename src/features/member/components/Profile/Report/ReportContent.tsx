import { memberApi } from "@/features/member/api";

import ActivitySummaryCard from "./ActivitySummaryCard";
import CategoryParticipationCard from "./CategoryParticipationCard";
import ReceivedEmojiCard from "./ReceivedEmojiCard";
import SessionHistorySection from "./SessionHistorySection";
import SessionPerformanceCard from "./SessionPerformanceCard";

export default async function ReportContent() {
  const data = await memberApi.getMyReport();

  if (!data?.result) {
    throw new Error("Failed to load report");
  }

  const report = data.result;

  return (
    <div className="flex flex-col gap-[80px]">
      <div className="gap-lg grid grid-cols-2">
        <ActivitySummaryCard data={report.activitySummary} />
        <CategoryParticipationCard data={report.categoryParticipation} />
      </div>

      <div className="gap-lg grid grid-cols-2">
        <ReceivedEmojiCard data={report.receivedEmojis} />
        <SessionPerformanceCard data={report.sessionPerformance} />
      </div>

      <SessionHistorySection
        items={report.sessionHistory.items}
        pagination={report.sessionHistory.pagination}
      />
    </div>
  );
}
