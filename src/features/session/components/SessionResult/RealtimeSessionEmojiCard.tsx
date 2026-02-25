"use client";

import ReceivedEmojiCard from "@/features/member/components/Profile/Report/ReceivedEmojiCard";
import type { ReceivedEmojiItem } from "@/features/member/types";

import { useSessionReactionSSE } from "../../hooks/useSessionReactionSSE";
import { mapSessionReactionToItems } from "../../utils/reportMappers";

interface RealtimeSessionEmojiCardProps {
  sessionId: string;
  initialEmojis: ReceivedEmojiItem[];
}

export function RealtimeSessionEmojiCard({
  sessionId,
  initialEmojis,
}: RealtimeSessionEmojiCardProps) {
  const { data: sseData } = useSessionReactionSSE({
    sessionId,
    enabled: true,
  });

  const emojis = sseData ? mapSessionReactionToItems(sseData) : initialEmojis;

  return <ReceivedEmojiCard data={emojis} />;
}
