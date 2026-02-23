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

export function ReceivedEmojiCard({ emojis }: ReceivedEmojiCardProps) {
  return (
    <article className="p-lg flex flex-1 flex-col rounded-lg bg-gray-900">
      <h3 className="text-lg font-semibold text-gray-50">내가 받은 이모지</h3>

      <div className="gap-lg mt-auto flex items-center">
        <div className="gap-xs flex items-center">
          <HeartIcon size="large" className="text-red-500" />
          <span className="text-lg font-semibold text-gray-50">{emojis.heart}</span>
        </div>
        <div className="gap-xs flex items-center">
          <ThumbsUpIcon size="large" className="text-yellow-500" />
          <span className="text-lg font-semibold text-gray-50">{emojis.thumbsUp}</span>
        </div>
        <div className="gap-xs flex items-center">
          <StarIcon size="large" className="text-cyan-500" />
          <span className="text-lg font-semibold text-gray-50">{emojis.star}</span>
        </div>
        <div className="gap-xs flex items-center">
          <ThumbsDownIcon size="large" className="text-orange-500" />
          <span className="text-lg font-semibold text-gray-50">{emojis.thumbsDown}</span>
        </div>
      </div>
    </article>
  );
}
