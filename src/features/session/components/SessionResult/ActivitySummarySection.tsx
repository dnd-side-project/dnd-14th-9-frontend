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
      <FocusTimeCard
        focusTimeMinutes={focusTimeMinutes}
        totalDurationMinutes={totalDurationMinutes}
        focusRate={focusRate}
      />
      <ReceivedEmojiCard emojis={emojis} />
    </section>
  );
}
