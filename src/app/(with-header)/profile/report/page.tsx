import ActivitySummaryCard from "@/features/member/components/Profile/Report/ActivitySummaryCard";
import CategoryParticipationCard from "@/features/member/components/Profile/Report/CategoryParticipationCard";
import ReceivedEmojiCard from "@/features/member/components/Profile/Report/ReceivedEmojiCard";
import SessionHistorySection from "@/features/member/components/Profile/Report/SessionHistorySection";
import SessionPerformanceCard from "@/features/member/components/Profile/Report/SessionPerformanceCard";

export default function ProfileReportPage() {
  return (
    <div className="flex flex-col gap-[80px]">
      <div className="gap-lg grid grid-cols-2">
        <ActivitySummaryCard />
        <CategoryParticipationCard />
      </div>

      <div className="gap-lg grid grid-cols-2">
        <ReceivedEmojiCard />
        <SessionPerformanceCard />
      </div>

      <SessionHistorySection />
    </div>
  );
}
