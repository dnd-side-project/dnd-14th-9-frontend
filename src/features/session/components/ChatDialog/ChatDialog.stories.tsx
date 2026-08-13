import { useState } from "react";

import type { QuickActionType } from "@/lib/socket/types";

import { ChatDialog } from "./ChatDialog";
import { QUICK_ACTION_CONFIG } from "./quickActionConfig";

import type { ChatMessage } from "./useSessionChat";
import type { InProgressMember } from "../../types";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const MEMBERS: InProgressMember[] = [
  {
    memberId: 1,
    nickname: "각잡은 호랑이",
    role: "HOST",
    achievementRate: 50,
    status: "FOCUSED",
    task: null,
  },
  {
    memberId: 2,
    nickname: "참여자 곰돌이",
    role: "PARTICIPANT",
    achievementRate: 20,
    status: "FOCUSED",
    task: null,
  },
];

const MESSAGES: ChatMessage[] = [
  {
    id: 1,
    memberId: 1,
    type: "TEXT",
    content: "안녕하세요:) 모각코 스프린트 시작합니다!",
    quickActionType: null,
    receivedAt: new Date(2026, 6, 3, 14, 0),
  },
  {
    id: 2,
    memberId: 2,
    type: "TEXT",
    content: "좋아요! 오늘은 포트폴리오 작업을 끝낼게요.",
    quickActionType: null,
    receivedAt: new Date(2026, 6, 3, 14, 5),
  },
  {
    id: 3,
    memberId: 1,
    type: "QUICK_ACTION",
    content: "핸드폰은 잠시 내려놓고 집중해요!",
    quickActionType: "PHONE_BAN",
    receivedAt: new Date(2026, 6, 3, 14, 10),
  },
];

function ChatDialogStory({ isHost }: { isHost: boolean }) {
  const [inputValue, setInputValue] = useState("");
  const [selectedQuickAction, setSelectedQuickAction] = useState<QuickActionType | null>(null);

  const selectQuickAction = (type: QuickActionType) => {
    const next = selectedQuickAction === type ? null : type;
    setSelectedQuickAction(next);
    setInputValue(next ? QUICK_ACTION_CONFIG[next].message : "");
  };

  return (
    <ChatDialog
      isHost={isHost}
      myMemberId={isHost ? 1 : 2}
      category="개발"
      title="React 포트폴리오 리팩토링"
      description="오후 시간, 각자 코딩 작업에 집중하는 모각작 세션입니다."
      notice="빡집중해서 같이 코딩해요!"
      participantCount={MEMBERS.length}
      members={MEMBERS}
      chat={{
        messages: MESSAGES,
        status: "connected",
        inputValue,
        setInputValue,
        selectedQuickAction,
        selectQuickAction,
        sendMessage: () => {
          setInputValue("");
          setSelectedQuickAction(null);
        },
      }}
      onClose={() => {}}
    />
  );
}

const META = {
  title: "Features/Session/ChatDialog",
  component: ChatDialogStory,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof ChatDialogStory>;

export default META;
type Story = StoryObj<typeof META>;

export const HOST: Story = {
  args: { isHost: true },
};

export const PARTICIPANT: Story = {
  args: { isHost: false },
};
