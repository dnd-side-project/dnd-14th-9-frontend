import { ChatMessageList } from "./ChatMessageList";

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

const at = (minute: number) => new Date(2026, 6, 3, 14, minute);

// 호스트가 인사 → 연속 메시지(그룹핑) → 텍스트+퀵액션 순차 전송까지 재현한 가짜 데이터
const MESSAGES: ChatMessage[] = [
  {
    id: 1,
    memberId: 1,
    type: "TEXT",
    content: "안녕하세요:) 모각코 스프린트 시작합니다!",
    quickActionType: null,
    receivedAt: at(0),
  },
  {
    id: 2,
    memberId: 1,
    type: "TEXT",
    content: "다들 집중 잘 하고 계신가요?",
    quickActionType: null,
    receivedAt: at(25),
  },
  {
    id: 3,
    memberId: 1,
    type: "TEXT",
    content: "핸드폰 내려놓고 집중!",
    quickActionType: null,
    receivedAt: at(26),
  },
  {
    id: 4,
    memberId: 1,
    type: "QUICK_ACTION",
    content: null,
    quickActionType: "PHONE_BAN",
    receivedAt: at(26),
  },
];

const META = {
  title: "Features/Session/ChatMessageList",
  component: ChatMessageList,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="bg-surface-default border-border-default flex h-105 w-[510px] flex-col rounded-lg border p-6">
        <Story />
      </div>
    ),
  ],
  args: {
    messages: MESSAGES,
    members: MEMBERS,
  },
} satisfies Meta<typeof ChatMessageList>;

export default META;
type Story = StoryObj<typeof META>;

/** 참여자 시점 — 방장 메시지가 좌측(아바타는 그룹 첫 메시지에만) */
export const PARTICIPANT_VIEW: Story = {
  args: {
    myMemberId: 2,
  },
};

/** 방장 시점 — 본인 메시지가 우측 정렬, 아바타 없음 */
export const HOST_VIEW: Story = {
  args: {
    myMemberId: 1,
  },
};

/** 메시지가 없는 초기 상태 */
export const EMPTY: Story = {
  args: {
    messages: [],
    myMemberId: 2,
  },
};
