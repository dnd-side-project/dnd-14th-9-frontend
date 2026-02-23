import { HeartIcon } from "@/components/Icon/HeartIcon";
import { StarIcon } from "@/components/Icon/StarIcon";
import { ThumbsDownIcon } from "@/components/Icon/ThumbsDownIcon";
import { ThumbsUpIcon } from "@/components/Icon/ThumbsUpIcon";

interface EmojiCount {
  heart: number;
  thumbsUp: number;
  star: number;
  thumbsDown: number;
}

interface ReceivedEmojiCardProps {
  emojis: EmojiCount;
}

const EMOJI_CONFIG = [
  { key: "heart" as const, Icon: HeartIcon, label: "하트" },
  { key: "thumbsUp" as const, Icon: ThumbsUpIcon, label: "최고예요" },
  { key: "star" as const, Icon: StarIcon, label: "별" },
  { key: "thumbsDown" as const, Icon: ThumbsDownIcon, label: "아쉬워요" },
];

export function ReceivedEmojiCard({ emojis }: ReceivedEmojiCardProps) {
  // 가장 많이 받은 이모지 찾기
  const maxCount = Math.max(emojis.heart, emojis.thumbsUp, emojis.star, emojis.thumbsDown);
  const maxEmoji = EMOJI_CONFIG.find((config) => emojis[config.key] === maxCount);

  return (
    <article className="border-border-subtle p-lg flex flex-1 flex-col rounded-lg border bg-gray-900">
      {/* 이모지 바 그래프 */}
      <div className="gap-md flex flex-1 items-end">
        {EMOJI_CONFIG.map((config) => {
          const count = emojis[config.key];
          const isMax = count === maxCount && maxCount > 0;
          // 높이 계산: 최대값 기준 비율 (최소 40px, 최대 100px)
          const heightPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;
          const barHeight = Math.max(40, Math.min(100, 40 + (heightPercent * 60) / 100));

          return (
            <div key={config.key} className="gap-xs flex flex-1 flex-col items-center justify-end">
              {/* 이모지 박스 */}
              <div
                className={`flex w-full flex-col items-center justify-center rounded-lg bg-gray-800 transition-all ${
                  isMax ? "ring-2 ring-green-500" : ""
                }`}
                style={{ height: `${barHeight}px` }}
              >
                <config.Icon size="large" />
                <span className="mt-xs text-sm font-semibold text-gray-50">{count}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 가장 많이 받은 이모지 텍스트 */}
      {maxEmoji && maxCount > 0 && (
        <p className="mt-md text-center text-sm text-gray-400">
          {maxEmoji.label}를 제일 많이 받았어요
        </p>
      )}
    </article>
  );
}
