import { FocusTimeCard } from "./FocusTimeCard";
import { ReceivedEmojiCard } from "./ReceivedEmojiCard";

interface EmojiCount {
  heart: number;
  thumbsUp: number;
  star: number;
  thumbsDown: number;
}

interface ActivitySummarySectionProps {
  focusTimeMinutes: number;
  totalDurationMinutes: number;
  focusRate: number;
  emojis: EmojiCount;
}

export function ActivitySummarySection({
  focusTimeMinutes,
  totalDurationMinutes,
  focusRate,
  emojis,
}: ActivitySummarySectionProps) {
  return (
    <section className="gap-lg flex">
      {/* 나의 활동 요약 */}
      <div className="flex flex-1 flex-col">
        <h3 className="mb-md text-lg font-semibold text-gray-50">나의 활동 요약</h3>
        <FocusTimeCard
          focusTimeMinutes={focusTimeMinutes}
          totalDurationMinutes={totalDurationMinutes}
          focusRate={focusRate}
        />
      </div>

      {/* 내가 받은 이모지 */}
      <div className="flex flex-1 flex-col">
        <h3 className="mb-md text-lg font-semibold text-gray-50">내가 받은 이모지</h3>
        <ReceivedEmojiCard emojis={emojis} />
      </div>
    </section>
  );
}
