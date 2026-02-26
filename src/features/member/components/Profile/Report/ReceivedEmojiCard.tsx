import type { ElementType } from "react";

import { HeartFillIcon } from "@/components/Icon/HeartFillIcon";
import { StarIcon } from "@/components/Icon/StarIcon";
import { ThumbDownIcon } from "@/components/Icon/ThumbDownIcon";
import { ThumbUpIcon } from "@/components/Icon/ThumbUpIcon";
import ReportCard from "@/components/ReportCard/ReportCard";
import SectionTitle from "@/components/ReportCard/SectionTitle";
import type { ReceivedEmojiItem } from "@/features/member/types";

const EMOJI_META: Record<string, { label: string; topText: string; icon: ElementType | null }> = {
  HEART: { label: "하트", topText: "하트를 제일 많이 받았어요!", icon: HeartFillIcon },
  THUMBS_UP: { label: "좋아요", topText: "좋아요를 제일 많이 받았어요!", icon: ThumbUpIcon },
  THUMBS_DOWN: { label: "싫어요", topText: "싫어요를 제일 많이 받았어요!", icon: ThumbDownIcon },
  STAR: { label: "별", topText: "별을 제일 많이 받았어요!", icon: StarIcon },
};

interface ReceivedEmojiCardProps {
  data: ReceivedEmojiItem[];
}

export default function ReceivedEmojiCard({ data }: ReceivedEmojiCardProps) {
  const hasAnyReaction = data.some((emoji) => emoji.count > 0);

  // Sort by count descending to get top emoji
  const sortedEmojis = [...data].sort((a, b) => b.count - a.count);
  const topEmoji = sortedEmojis[0];
  const restEmojis = sortedEmojis.slice(1);

  const TopIcon = EMOJI_META[topEmoji.emojiName]?.icon;

  return (
    <ReportCard>
      <SectionTitle>받은 이모지</SectionTitle>
      {data.length > 0 && (
        <div className="p-xl border-sm border-border-subtle flex min-h-40 items-center justify-center gap-4 rounded-md">
          {hasAnyReaction ? (
            <>
              {/** 큰 이모지 카드 */}
              <div className="px-xl py-2xl bg-surface-strong gap-lg flex flex-col items-center justify-center rounded-md">
                <p className="text-text-secondary px-lg py-xs flex items-center justify-center text-base font-semibold">
                  {TopIcon ? (
                    <TopIcon size="xlarge" />
                  ) : (
                    EMOJI_META[topEmoji.emojiName]?.label || `${topEmoji.emojiName} 이모지`
                  )}
                </p>
                <div className="gap-xs flex flex-col items-center">
                  <p className="text-text-primary text-2xl font-bold">{topEmoji.count}</p>
                  <p className="text-text-tertiary font-regular text-[11px]">
                    {EMOJI_META[topEmoji.emojiName]?.topText ||
                      `${topEmoji.emojiName} 이모지를 제일 많이 받았어요!`}
                  </p>
                </div>
              </div>

              {/** 작은 이모지 카드들 */}
              {restEmojis.map((emoji) => {
                const Icon = EMOJI_META[emoji.emojiName]?.icon;
                return (
                  <div
                    key={emoji.emojiName}
                    className="gap-xs py-lg px-md bg-surface-strong flex flex-1 flex-col items-center justify-center self-end rounded-sm"
                  >
                    <p className="px-lg py-sm flex items-center justify-center">
                      {Icon ? (
                        <Icon size="medium" className="text-text-tertiary" />
                      ) : (
                        EMOJI_META[emoji.emojiName]?.label || `${emoji.emojiName} 이모지`
                      )}
                    </p>
                    <p className="text-text-muted font-regular text-base">{emoji.count}</p>
                  </div>
                );
              })}
            </>
          ) : (
            <p className="text-text-tertiary font-regular text-sm">아직 받은 리액션이 없어요</p>
          )}
        </div>
      )}
    </ReportCard>
  );
}
