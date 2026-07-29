"use client";

import { useEffect, useRef } from "react";

import { ChatBubble } from "@/components/ChatBubble/ChatBubble";
import { formatTimeHHMM } from "@/lib/utils/date";

import { QUICK_ACTION_CONFIG } from "./quickActionConfig";

import type { ChatMessage } from "./useSessionChat";
import type { InProgressMember } from "../../types";

interface ChatMessageListProps {
  messages: ChatMessage[];
  members: InProgressMember[];
  myMemberId?: number;
}

export function ChatMessageList({ messages, members, myMemberId }: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // 발신자 조회용 Map (members는 참여자라 작아, 매 렌더 생성해도 부담 없음)
  const memberMap = new Map(members.map((member) => [member.memberId, member]));

  useEffect(() => {
    bottomRef.current?.scrollIntoView?.({ block: "end" });
  }, [messages]);

  return (
    <div className="scrollbar-hide flex flex-1 flex-col gap-5 overflow-y-auto">
      <p className="text-text-muted text-center text-[15px]">현재는 방장만 채팅할 수 있어요</p>
      {messages.map((message) => {
        const sender = memberMap.get(message.memberId);
        const isMe = message.memberId === myMemberId;
        // QUICK_ACTION 메시지는 지정 문구(content)와 칩을 함께 담고 있어,
        // ChatBubble이 말풍선+칩을 아바타 하나로 묶어 그린다
        const quickAction = message.quickActionType
          ? QUICK_ACTION_CONFIG[message.quickActionType]
          : null;

        return (
          <ChatBubble
            key={message.id}
            text={message.content ?? ""}
            align={isMe ? "right" : "left"}
            showAvatar={!isMe}
            isSenderHost={sender?.role === "HOST"}
            avatarSrc={sender?.profileImageUrl}
            senderNickname={sender?.nickname}
            quickAction={
              quickAction
                ? { icon: <quickAction.Icon size="xsmall" />, label: quickAction.label }
                : undefined
            }
            timestamp={formatTimeHHMM(message.receivedAt)}
          />
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
