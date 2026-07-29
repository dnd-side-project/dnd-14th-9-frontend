import { ThumbsUpIcon } from "@/components/Icon/ThumbsUpIcon";

import { ChatBubble } from "./ChatBubble";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const META = {
  title: "Components/ChatBubble",
  component: ChatBubble,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    align: {
      control: "radio",
      options: ["left", "right"],
    },
    showAvatar: {
      control: "boolean",
    },
    isSenderHost: {
      control: "boolean",
    },
  },
  args: {
    text: "안녕하세요! 반갑습니다",
    timestamp: "14:00",
    senderNickname: "각잡은 호랑이",
  },
} satisfies Meta<typeof ChatBubble>;

export default META;
type Story = StoryObj<typeof META>;

/** 수신 메시지(상대방) — 좌측 정렬, 아바타 노출 */
export const RECEIVED: Story = {
  args: {
    align: "left",
  },
};

/** 방장이 보낸 수신 메시지 — 좌측 정렬, 아바타 + 방장 배지 */
export const RECEIVED_FROM_HOST: Story = {
  args: {
    align: "left",
    isSenderHost: true,
  },
};

/** 내가 보낸 메시지 — 우측 정렬, 아바타 없음 */
export const SENT: Story = {
  args: {
    align: "right",
  },
};

/** 퀵 액션 메시지 */
export const QUICK_ACTION: Story = {
  args: {
    align: "left",
    isSenderHost: true,
    quickAction: {
      icon: <ThumbsUpIcon size="xsmall" />,
      label: "좋아요",
    },
  },
};
