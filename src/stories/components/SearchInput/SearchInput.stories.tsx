import { SearchInput } from "@/components/SearchInput/SearchInput";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Components/SearchInput",
  component: SearchInput,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "검색 입력 필드(`SearchField`) 컴포넌트입니다. 피그마 디자인 시스템(Node `417:5268`)에 따라 `md`(580×56px, 16px 폰트, 24px 아이콘)와 `sm`(375×44px, 13px 폰트, 20px 아이콘) 사이즈 및 Default, Typing(포커스), Filled 상태를 지원합니다.",
      },
    },
  },
  argTypes: {
    size: {
      control: "radio",
      options: ["md", "sm"],
      description: "검색창 크기 (md: 580×56px / sm: 375×44px)",
      table: {
        defaultValue: { summary: "md" },
      },
    },
    placeholder: {
      control: "text",
      description: "입력 필드 플레이스홀더 텍스트",
    },
    defaultValue: {
      control: "text",
      description: "초기 입력값 (Filled 상태 테스트)",
    },
    disabled: {
      control: "boolean",
      description: "비활성화 상태",
    },
  },
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: "md",
    placeholder: "관심 분야의 세션을 검색해 보세요",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    placeholder: "관심 분야의 세션을 검색해 보세요",
  },
};

export const Filled: Story = {
  args: {
    size: "md",
    placeholder: "관심 분야의 세션을 검색해 보세요",
    defaultValue: "바이브코딩",
  },
};

export const Disabled: Story = {
  args: {
    size: "md",
    placeholder: "검색어를 입력하세요",
    disabled: true,
  },
};
