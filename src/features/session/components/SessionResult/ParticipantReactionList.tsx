"use client";

import { ApiError } from "@/lib/api/api-client";
import { DEFAULT_API_ERROR_MESSAGE } from "@/lib/error/error-codes";
import { toast } from "@/lib/toast";

import { useSendReaction } from "../../hooks/useSessionHooks";
import { mapEmojiKeyToType } from "../../utils/reportMappers";

import { ParticipantGoalSection } from "./ParticipantGoalSection";

interface ParticipantData {
  memberId: number;
  participantName: string;
  profileImageUrl?: string;
  goal: string;
  todoAchievementRate: number;
  focusRate: number;
}

interface ParticipantReactionListProps {
  sessionId: string;
  participants: ParticipantData[];
}

export function ParticipantReactionList({ sessionId, participants }: ParticipantReactionListProps) {
  const sendReaction = useSendReaction();

  const handleEmojiClick = async (
    emoji: "heart" | "thumbsUp" | "thumbsDown" | "star",
    targetMemberId: number
  ) => {
    try {
      await sendReaction.mutateAsync({
        sessionId,
        body: { targetMemberId, emojiType: mapEmojiKeyToType(emoji) },
      });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : DEFAULT_API_ERROR_MESSAGE;
      toast.error(message);
      throw error;
    }
  };

  return (
    <ul className="gap-sm flex flex-col">
      {participants.map((participant) => (
        <ParticipantGoalSection
          key={participant.memberId}
          participantName={participant.participantName}
          profileImageUrl={participant.profileImageUrl}
          goal={participant.goal}
          todoAchievementRate={participant.todoAchievementRate}
          focusRate={participant.focusRate}
          onEmojiClick={(emoji) => handleEmojiClick(emoji, participant.memberId)}
        />
      ))}
    </ul>
  );
}
