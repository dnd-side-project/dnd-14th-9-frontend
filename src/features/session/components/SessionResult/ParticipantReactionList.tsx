"use client";

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

  const handleEmojiClick = (
    emoji: "heart" | "thumbsUp" | "thumbsDown" | "star",
    targetMemberId: number
  ) => {
    sendReaction.mutate({
      sessionId,
      body: { targetMemberId, emojiType: mapEmojiKeyToType(emoji) },
    });
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
