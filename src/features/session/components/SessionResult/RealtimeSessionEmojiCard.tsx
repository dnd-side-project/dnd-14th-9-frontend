"use client";

import ReceivedEmojiCard from "@/features/member/components/Profile/Report/ReceivedEmojiCard";
import type { ReceivedEmojiItem } from "@/features/member/types";

import { useReactionSummarySSE } from "../../hooks/useReactionSummarySSE";
import { mapEmojiResultToItems } from "../../utils/reportMappers";

interface RealtimeSessionEmojiCardProps {
  sessionId: string;
  initialEmojis: ReceivedEmojiItem[];
}

export function RealtimeSessionEmojiCard({
  sessionId,
  initialEmojis,
}: RealtimeSessionEmojiCardProps) {
  const { data: sseData } = useReactionSummarySSE({
    sessionId,
    enabled: true,
  });

  // 참여자 리포트에서는 세션 전체 합계를 노출한다.
  const emojis = sseData ? mapEmojiResultToItems(sseData.total) : initialEmojis;

  return <ReceivedEmojiCard data={emojis} />;
}
