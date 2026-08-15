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

/**
 * 피그마 스펙 매트릭스 (Figma Node: 417:5268)
 * - Size: md (Medium, 56px) / sm (Small, 44px)
 * - State: Default / Focus (Typing) / Filled
 */
export const FigmaSpecMatrix: Story = {
  render: () => (
    <div className="bg-surface-default border-border-gray-default flex w-[900px] flex-col gap-8 rounded-xl border p-8 text-white">
      <div>
        <h3 className="text-lg font-bold text-gray-50">Search Field Design System Matrix</h3>
        <p className="text-xs text-gray-400">Figma Node ID: 417:5268</p>
      </div>

      {/* Medium Section */}
      <div className="flex flex-col gap-4">
        <span className="text-text-brand-default text-sm font-semibold">
          Medium (size=&quot;md&quot; · 580×56px · 16px font · 24px icon)
        </span>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <span className="w-20 text-xs text-gray-400">Default</span>
            <SearchInput size="md" placeholder="관심 분야의 세션을 검색해 보세요" />
          </div>
          <div className="flex items-center gap-4">
            <span className="w-20 text-xs text-gray-400">Filled</span>
            <SearchInput
              size="md"
              placeholder="관심 분야의 세션을 검색해 보세요"
              defaultValue="바이브코딩"
            />
          </div>
        </div>
      </div>

      <div className="border-border-gray-default border-t" />

      {/* Small Section */}
      <div className="flex flex-col gap-4">
        <span className="text-text-brand-default text-sm font-semibold">
          Small (size=&quot;sm&quot; · 375×44px · 13px font · 20px icon)
        </span>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <span className="w-20 text-xs text-gray-400">Default</span>
            <SearchInput size="sm" placeholder="관심 분야의 세션을 검색해 보세요" />
          </div>
          <div className="flex items-center gap-4">
            <span className="w-20 text-xs text-gray-400">Filled</span>
            <SearchInput
              size="sm"
              placeholder="관심 분야의 세션을 검색해 보세요"
              defaultValue="바이브코딩"
            />
          </div>
        </div>
      </div>
    </div>
  ),
};

export const SizeComparison: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex flex-col gap-2">
        <span className="text-xs text-gray-300">size=&quot;md&quot; (Desktop / 56px)</span>
        <SearchInput size="md" placeholder="관심 분야의 세션을 검색해 보세요" />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs text-gray-300">size=&quot;sm&quot; (Mobile / 44px)</span>
        <SearchInput size="sm" placeholder="관심 분야의 세션을 검색해 보세요" />
      </div>
    </div>
  ),
};
