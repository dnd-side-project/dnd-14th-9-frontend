"use client";

import { useState } from "react";

import { Avatar } from "@/components/Avatar/Avatar";
import { HeartFillIcon } from "@/components/Icon/HeartFillIcon";
import { StarIcon } from "@/components/Icon/StarIcon";
import { ThumbDownIcon } from "@/components/Icon/ThumbDownIcon";
import { ThumbUpIcon } from "@/components/Icon/ThumbUpIcon";

interface ParticipantGoalSectionProps {
  participantName: string;
  profileImageUrl?: string;
  goal: string;
  todoAchievementRate: number;
  focusRate: number;
  onEmojiClick?: (emoji: "heart" | "thumbsUp" | "thumbsDown" | "star") => void;
}

const EMOJI_CONFIG = [
  { key: "heart" as const, Icon: HeartFillIcon, label: "하트" },
  { key: "thumbsUp" as const, Icon: ThumbUpIcon, label: "좋아요" },
  { key: "thumbsDown" as const, Icon: ThumbDownIcon, label: "싫어요" },
  { key: "star" as const, Icon: StarIcon, label: "별" },
];

export function ParticipantGoalSection({
  participantName,
  profileImageUrl,
  goal,
  todoAchievementRate,
  focusRate,
  onEmojiClick,
}: ParticipantGoalSectionProps) {
  const [activeEmoji, setActiveEmoji] = useState<string | null>(null);

  const handleEmojiClick = (emoji: "heart" | "thumbsUp" | "thumbsDown" | "star") => {
    setActiveEmoji(activeEmoji === emoji ? null : emoji);
    onEmojiClick?.(emoji);
  };

  return (
    <li className="bg-surface-strong border-border-subtle rounded-sm border">
      <div className="p-sm flex items-start gap-3">
        {/* 프로필 이미지 */}
        <div className="shrink-0">
          <Avatar
            size="xlarge"
            type={profileImageUrl ? "image" : "empty"}
            src={profileImageUrl}
            alt={participantName}
          />
        </div>

        {/* 정보 */}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-base font-semibold text-gray-50">{participantName}</span>
          <span className="truncate text-xs font-bold text-gray-500">{goal}</span>
          <div className="mt-md flex items-center gap-2">
            {/* 달성률 */}
            <span className="text-text-secondary text-xs">달성률</span>
            <span className="px-xs py-2xs text-text-secondary rounded-xs bg-white/8 text-xs">
              {todoAchievementRate}%
            </span>
            <span className="text-text-disabled text-xs">|</span>
            {/* 집중도 */}
            <span className="text-text-secondary text-xs">집중도</span>
            <span className="px-xs py-2xs rounded-xs bg-red-600/20 text-xs text-red-500">
              {focusRate}%
            </span>
          </div>
        </div>

        {/* 오른쪽: 이모지 버튼들 */}
        <div className="gap-sm flex shrink-0">
          {EMOJI_CONFIG.map((config) => {
            const isActive = activeEmoji === config.key;
            return (
              <button
                key={config.key}
                type="button"
                onClick={() => handleEmojiClick(config.key)}
                className={`group flex size-10 cursor-pointer items-center justify-center rounded-full transition-colors ${
                  isActive
                    ? "bg-surface-primary-default"
                    : "bg-surface-default hover:bg-surface-primary-default active:bg-surface-primary-default"
                }`}
                aria-label={config.label}
              >
                <config.Icon
                  size="small"
                  className={`transition-colors ${
                    isActive
                      ? "text-text-inverse"
                      : "text-text-muted group-hover:text-text-inverse group-active:text-text-inverse"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </li>
  );
}
