"use client";

import ReceivedEmojiCard from "@/features/member/components/Profile/Report/ReceivedEmojiCard";
import type { ReceivedEmojiItem } from "@/features/member/types";

import { useReactionSummarySSE } from "../../hooks/useReactionSummarySSE";
import { mapEmojiResultToItems } from "../../utils/reportMappers";

interface RealtimeMemberEmojiCardProps {
  sessionId: string;
  initialEmojis: ReceivedEmojiItem[];
}

export function RealtimeMemberEmojiCard({
  sessionId,
  initialEmojis,
}: RealtimeMemberEmojiCardProps) {
  const { data: sseData } = useReactionSummarySSE({
    sessionId,
    enabled: true,
  });

  // 나의 리포트에서는 본인이 받은 합계를 노출한다.
  // 대상 멤버는 서버가 토큰으로 판별하므로 memberId를 넘기지 않는다.
  const emojis = sseData ? mapEmojiResultToItems(sseData.my) : initialEmojis;

  return <ReceivedEmojiCard data={emojis} />;
}
