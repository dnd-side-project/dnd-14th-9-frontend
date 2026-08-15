import { useState } from "react";

import { CategoryFilterButton } from "@/components/CategoryFilterButton/CategoryFilterButton";
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
