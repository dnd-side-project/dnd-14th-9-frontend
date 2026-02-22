import ReportCard from "@/components/ReportCard/ReportCard";
import SectionTitle from "@/components/ReportCard/SectionTitle";

const MOCK_RECEIVED_EMOJI_STATS = [
  {
    emojiName: "HEART",
    count: "12",
  },
  {
    emojiName: "THUMBS_UP",
    count: "8",
  },
  {
    emojiName: "THUMBS_DOWN",
    count: "5",
  },
  {
    emojiName: "STAR",
    count: "2",
  },
];

const EMOJI_META: Record<string, { label: string; topText: string }> = {
  HEART: { label: "하트", topText: "하트를 제일 많이 받았어요!" },
  THUMBS_UP: { label: "좋아요", topText: "좋아요를 제일 많이 받았어요!" },
  THUMBS_DOWN: { label: "싫어요", topText: "싫어요를 제일 많이 받았어요!" },
  STAR: { label: "별", topText: "별을 제일 많이 받았어요!" },
};

export default function ReceivedEmojiCard() {
  const topEmoji = MOCK_RECEIVED_EMOJI_STATS[0];
  const restEmojis = MOCK_RECEIVED_EMOJI_STATS.slice(1);

  return (
    <ReportCard>
      <SectionTitle>받은 이모지</SectionTitle>
      {/** 큰 이모지 카드 */}
      {MOCK_RECEIVED_EMOJI_STATS.length > 0 && (
        <div className="p-xl border-sm border-border-subtle flex gap-[16px] rounded-md border">
          <div className="px-xl py-2xl bg-surface-strong gap-lg flex flex-col items-center justify-center rounded-md">
            <p className="text-text-secondary px-lg py-xs text-[16px] font-semibold">
              {EMOJI_META[topEmoji.emojiName]?.label || `${topEmoji.emojiName} 이모지`}
            </p>
            <div className="gap-xs flex flex-col items-center">
              <p className="text-text-primary text-[24px] font-bold">{topEmoji.count}</p>
              <p className="text-text-tertiary font-regular text-[11px]">
                {EMOJI_META[topEmoji.emojiName]?.topText ||
                  `${topEmoji.emojiName} 이모지를 제일 많이 받았어요!`}
              </p>
            </div>
          </div>

          {/** 작은 이모지 카드들 */}
          {restEmojis.map((emoji) => (
            <div
              key={emoji.emojiName}
              className="gap-xs py-lg px-md bg-surface-strong flex flex-col items-center justify-center self-end rounded-sm"
            >
              <p className="px-lg py-sm">
                {EMOJI_META[emoji.emojiName]?.label || `${emoji.emojiName} 이모지`}
              </p>
              <p className="text-text-muted font-regular text-[16px]">{emoji.count}</p>
            </div>
          ))}
        </div>
      )}
    </ReportCard>
  );
}
