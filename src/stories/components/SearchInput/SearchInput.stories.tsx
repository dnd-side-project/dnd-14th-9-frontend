import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SearchInput } from "@/components/SearchInput/SearchInput";

const meta = {
  title: "Components/SearchInput",
  component: SearchInput,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "검색 입력 필드 컴포넌트입니다. 오른쪽에 검색 아이콘이 포함되어 있으며 최대 너비 580px로 반응형으로 동작합니다.",
      },
    },
  },
  argTypes: {
    placeholder: {
      control: "text",
      description: "입력 필드 플레이스홀더 텍스트",
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
    placeholder: "검색어를 입력하세요",
  },
};

export const PCWidth: Story = {
  args: {
    placeholder: "검색어를 입력하세요",
  },
  parameters: {
    viewport: {
      defaultViewport: "desktop",
    },
    backgrounds: {
      default: "dark",
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "600px", padding: "20px", background: "#0b0f0e" }}>
        <Story />
      </div>
    ),
  ],
};

export const WithValue: Story = {
  args: {
    placeholder: "검색어를 입력하세요",
    defaultValue: "React",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "검색어를 입력하세요",
    disabled: true,
  },
};
