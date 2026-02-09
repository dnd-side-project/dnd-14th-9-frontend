import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Filter } from "@/components/Filter/Filter";

const meta = {
  title: "Components/Filter",
  component: Filter,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "드롭다운을 열고 닫는 필터 버튼 컴포넌트입니다. 다크 모드가 기본이며, 다양한 크기와 radius 옵션을 지원합니다.",
      },
    },
    backgrounds: {
      default: "dark",
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["large", "small"],
      description: "필터 버튼 크기",
    },
    radius: {
      control: "select",
      options: ["max", "sm"],
      description: "모서리 둥글기 (max: 999px, sm: 6px)",
    },
    bordered: {
      control: "boolean",
      description: "테두리 표시 여부",
    },
    isOpen: {
      control: "boolean",
      description: "드롭다운 열림 상태 (아이콘 회전)",
    },
    children: {
      control: "text",
      description: "필터 레이블 텍스트",
    },
  },
  decorators: [
    (Story) => (
      <div className="dark" style={{ padding: "20px", background: "#0b0f0e" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Filter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "필터",
  },
};

export const Large: Story = {
  args: {
    children: "필터",
    size: "large",
  },
};

export const Small: Story = {
  args: {
    children: "필터",
    size: "small",
  },
};

export const RadiusMax: Story = {
  args: {
    children: "필터",
    radius: "max",
  },
};

export const RadiusSm: Story = {
  args: {
    children: "필터",
    radius: "sm",
  },
};

export const Bordered: Story = {
  args: {
    children: "필터",
    bordered: true,
  },
};

export const BorderedSmall: Story = {
  args: {
    children: "필터",
    size: "small",
    bordered: true,
  },
};

export const Open: Story = {
  args: {
    children: "필터",
    isOpen: true,
  },
};

export const InteractiveWithDropdown: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);

    const dropdownItems = ["최신순", "인기순", "가격순"];

    return (
      <div className="relative">
        <Filter {...args} isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
          {args.children}
        </Filter>
        {isOpen && (
          <div className="border-border-default absolute top-full left-0 mt-2 w-[120px] rounded-sm border bg-gray-900 py-2">
            {dropdownItems.map((item) => (
              <button
                key={item}
                type="button"
                className="text-text-secondary w-full px-3 py-2 text-left text-sm hover:bg-gray-800"
                onClick={() => setIsOpen(false)}
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  },
  args: {
    children: "필터",
  },
  parameters: {
    docs: {
      description: {
        story: "클릭하면 드롭다운이 열리고 아이콘이 180도 회전합니다.",
      },
    },
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <span className="w-24 text-sm text-gray-400">Large</span>
        <Filter size="large">필터</Filter>
        <Filter size="large" bordered>
          필터
        </Filter>
        <Filter size="large" radius="sm">
          필터
        </Filter>
        <Filter size="large" radius="sm" bordered>
          필터
        </Filter>
      </div>
      <div className="flex items-center gap-4">
        <span className="w-24 text-sm text-gray-400">Small</span>
        <Filter size="small">필터</Filter>
        <Filter size="small" bordered>
          필터
        </Filter>
        <Filter size="small" radius="sm">
          필터
        </Filter>
        <Filter size="small" radius="sm" bordered>
          필터
        </Filter>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Filter 컴포넌트의 모든 변형을 한눈에 비교합니다.",
      },
    },
  },
};
