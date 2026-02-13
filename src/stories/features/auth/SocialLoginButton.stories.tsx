import { SocialLoginButton } from "@/features/auth/components/SocialLoginButton";
import { LOGIN_PROVIDERS } from "@/lib/auth/login-policy";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Features/Auth/SocialLoginButton",
  component: SocialLoginButton,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "소셜 로그인 provider별 아이콘/라벨/스타일을 내부에서 처리하는 버튼 컴포넌트입니다.",
      },
    },
    backgrounds: {
      default: "dark",
    },
  },
  argTypes: {
    provider: {
      control: "select",
      options: LOGIN_PROVIDERS,
      description: "소셜 로그인 provider",
    },
    isLoading: {
      control: "boolean",
      description: "로딩 스피너 표시 여부",
    },
    disabled: {
      control: "boolean",
      description: "비활성화 여부",
    },
    onClick: {
      action: "clicked",
      description: "버튼 클릭 이벤트",
    },
  },
  decorators: [
    (Story) => (
      <div className="dark" style={{ width: "360px", padding: "20px", background: "#0b0f0e" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SocialLoginButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    provider: "kakao",
    isLoading: false,
    disabled: false,
  },
};

export const Google: Story = {
  args: {
    provider: "google",
    isLoading: false,
    disabled: false,
  },
};

export const Loading: Story = {
  args: {
    provider: "kakao",
    isLoading: true,
    disabled: true,
  },
};
