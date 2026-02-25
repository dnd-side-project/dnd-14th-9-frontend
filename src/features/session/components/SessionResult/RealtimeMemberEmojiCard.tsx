"use client";

import ReceivedEmojiCard from "@/features/member/components/Profile/Report/ReceivedEmojiCard";
import type { ReceivedEmojiItem } from "@/features/member/types";

import { useMemberReactionSSE } from "../../hooks/useMemberReactionSSE";
import { mapEmojiResultToItems } from "../../utils/reportMappers";

interface RealtimeMemberEmojiCardProps {
  sessionId: string;
  memberId: number;
  initialEmojis: ReceivedEmojiItem[];
}

export function RealtimeMemberEmojiCard({
  sessionId,
  memberId,
  initialEmojis,
}: RealtimeMemberEmojiCardProps) {
  const { data: sseData } = useMemberReactionSSE({
    sessionId,
    memberId: String(memberId),
    enabled: true,
  });

  const emojis = sseData ? mapEmojiResultToItems(sseData) : initialEmojis;

  return <ReceivedEmojiCard data={emojis} />;
}
