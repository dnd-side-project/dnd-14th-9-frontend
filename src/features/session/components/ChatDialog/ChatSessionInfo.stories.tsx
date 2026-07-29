import { ChatSessionInfo } from "./ChatSessionInfo";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const META = {
  title: "Features/Session/ChatSessionInfo",
  component: ChatSessionInfo,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="bg-surface-default border-border-default flex w-[510px] flex-col gap-5 rounded-lg border p-6">
        <Story />
      </div>
    ),
  ],
  args: {
    category: "개발",
    title: "React 포폴 리팩토링 스프린트",
    description: "오후 시간, 각자 코딩 작업에 집중하는 모각작 세션입니다!",
    notice: "빡집중해서 같이 코딩해요! 무분별한 자리비움은 지양합니다🙅‍♂️",
    participantCount: 6,
  },
} satisfies Meta<typeof ChatSessionInfo>;

export default META;
type Story = StoryObj<typeof META>;

export const DEFAULT: Story = {};
