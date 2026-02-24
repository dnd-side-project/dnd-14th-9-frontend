"use client";

import ReceivedEmojiCard from "@/features/member/components/Profile/Report/ReceivedEmojiCard";
import type { ReceivedEmojiItem } from "@/features/member/types";

import { useMemberReactionSSE } from "../../hooks/useMemberReactionSSE";
import { mapEmojiResultToItems } from "../../utils/reportMappers";

interface RealtimeReceivedEmojiCardProps {
  sessionId: string;
  memberId: number;
  initialEmojis: ReceivedEmojiItem[];
}

export function RealtimeReceivedEmojiCard({
  sessionId,
  memberId,
  initialEmojis,
}: RealtimeReceivedEmojiCardProps) {
  const { data: sseData } = useMemberReactionSSE({
    sessionId,
    memberId: String(memberId),
    enabled: true,
  });

  const emojis = sseData ? mapEmojiResultToItems(sseData) : initialEmojis;

  return <ReceivedEmojiCard data={emojis} />;
}
