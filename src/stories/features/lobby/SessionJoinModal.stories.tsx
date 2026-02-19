import { useState } from "react";

import { SessionJoinModal } from "@/features/lobby/components/SessionJoinModal";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Features/Lobby/SessionJoinModal",
  component: SessionJoinModal,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    nextjs: {
      appDirectory: true,
    },
    docs: {
      description: {
        component: "세션 참여 전 목표와 할 일을 입력하는 모달 컴포넌트입니다.",
      },
    },
  },
} satisfies Meta<typeof SessionJoinModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    sessionId: "1",
    onClose: () => {},
  },
  render: function Render(args) {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-lg bg-green-500 px-4 py-2 text-white"
        >
          세션 참여하기
        </button>
        {isOpen && <SessionJoinModal {...args} onClose={() => setIsOpen(false)} />}
      </>
    );
  },
};
