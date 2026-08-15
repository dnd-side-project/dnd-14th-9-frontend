import { useState } from "react";

import { CategoryFilterButton } from "@/components/CategoryFilterButton/CategoryFilterButton";
import { ChevronDownIcon } from "@/components/Icon/ChevronDownIcon";
import { CATEGORIES, getCategoryLabel, type CategoryFilter } from "@/lib/constants/category";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Components/CategoryFilterButton",
  component: CategoryFilterButton,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "피그마 `Category (Atomic)` (Node 417:3652) 디자인 시스템 스펙을 준수하는 카테고리 필터 버튼 컴포넌트입니다.",
      },
    },
    backgrounds: {
      default: "dark",
    },
  },
  argTypes: {
    isSelected: {
      control: "boolean",
      description: "선택된 상태 여부 (true 시 그린 틴트 배경 + 초록 텍스트)",
    },
    children: {
      control: "text",
      description: "버튼에 표시될 텍스트",
    },
  },
  decorators: [
    (Story) => (
      <div className="dark bg-background-default text-foreground min-h-[200px] p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CategoryFilterButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// 기본 스토리
// ---------------------------------------------------------------------------

export const Default: Story = {
  args: {
    isSelected: false,
    children: "카테고리",
  },
};

export const Selected: Story = {
  args: {
    isSelected: true,
    children: "선택된 카테고리",
  },
};

// ---------------------------------------------------------------------------
// 피그마 Atomic 스펙 상태 매트릭스 (Default, Hover, Selected)
// ---------------------------------------------------------------------------

export const FigmaAtomicSpecMatrix: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="border-border-default bg-surface-default flex flex-col gap-4 rounded-xl border p-6">
        <h4 className="text-text-primary text-sm font-semibold">
          Figma `Category/Atomic` (Node 417:3652) 상태별 스펙
        </h4>
        <div className="grid grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <span className="text-text-muted text-xs">1. Default</span>
            <CategoryFilterButton isSelected={false}>텍스트</CategoryFilterButton>
            <span className="text-text-disabled text-[11px]">bg: #1E2124 / text: #8A949E</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <span className="text-text-muted text-xs">2. Hover (마우스 오버)</span>
            <CategoryFilterButton
              isSelected={false}
              className="bg-surface-subtle text-text-primary"
            >
              텍스트
            </CategoryFilterButton>
            <span className="text-text-disabled text-[11px]">bg: #33363D / text: #F5F7FA</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <span className="text-text-muted text-xs">3. Selected</span>
            <CategoryFilterButton isSelected={true}>텍스트</CategoryFilterButton>
            <span className="text-text-disabled text-[11px]">bg: #52EE8533 / text: #22D15C</span>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "피그마에 정의된 Default, Hover, Selected 상태의 스타일 스펙(12px font, 12px 16px padding, 6px radius)을 1:1 비교합니다.",
      },
    },
  },
};

// ---------------------------------------------------------------------------
// 인터랙티브 단일 선택 (Single Select)
// ---------------------------------------------------------------------------

export const InteractiveSingleSelect: Story = {
  render: () => {
    const [selected, setSelected] = useState<CategoryFilter>("ALL");
    return (
      <div className="flex flex-col gap-4">
        <div className="text-text-muted text-xs">
          선택된 값:{" "}
          <span className="font-semibold text-green-600">{getCategoryLabel(selected)}</span> (
          {selected})
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <CategoryFilterButton
              key={cat}
              isSelected={selected === cat}
              onClick={() => setSelected(cat)}
            >
              {getCategoryLabel(cat)}
            </CategoryFilterButton>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "카테고리를 클릭하여 단일 선택(Single Select) 인터랙션을 테스트할 수 있습니다.",
      },
    },
  },
};

// ---------------------------------------------------------------------------
// 피그마 Chip/Filter (토글 칩) 컴포넌트 셋
// ---------------------------------------------------------------------------

export const FigmaChipFilterSet: Story = {
  render: () => (
    <div className="border-border-default bg-surface-default flex flex-col gap-6 rounded-xl border p-6">
      <h4 className="text-text-primary text-sm font-semibold">
        Figma `Chip/Filter` (Node 417:3489) 알약형 토글 칩 스펙
      </h4>
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col items-center gap-3">
          <span className="text-text-muted text-xs">1. Collapsed (접힘 상태)</span>
          <button
            type="button"
            className="border-alpha-white-16 border-sm bg-surface-default px-xs py-2xs hover:bg-surface-subtle rounded-max flex items-center justify-center transition-colors"
          >
            <ChevronDownIcon />
          </button>
          <span className="text-text-disabled text-[11px]">
            bg: #0B0F0E / border: 1px / rounded: 999px
          </span>
        </div>
        <div className="flex flex-col items-center gap-3">
          <span className="text-text-muted text-xs">2. Expanded (펼침 상태)</span>
          <button
            type="button"
            className="border-alpha-white-16 border-sm bg-surface-strong px-xs py-2xs hover:bg-surface-subtle rounded-max flex items-center justify-center transition-colors"
          >
            <ChevronDownIcon className="rotate-180" />
          </button>
          <span className="text-text-disabled text-[11px]">
            bg: #1E2124 / border: 1px / rounded: 999px
          </span>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "카테고리 확장/접기 시 사용되는 Chip/Filter 칩 컴포넌트의 상태별 스펙입니다.",
      },
    },
  },
};
