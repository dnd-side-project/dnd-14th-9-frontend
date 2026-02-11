import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { LoginModal } from "@/features/auth/components/LoginModal";

const meta = {
  title: "Features/Auth/LoginModal",
  component: LoginModal,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
    docs: {
      description: {
        component: "인터셉트 라우트에서 표시되는 로그인 모달 컴포넌트입니다.",
      },
      story: {
        inline: false,
        height: "720px",
      },
    },
  },
} satisfies Meta<typeof LoginModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    nextPath: "/",
  },
};
