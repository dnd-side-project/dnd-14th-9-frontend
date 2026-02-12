import { CategoryFilterButton } from "@/components/CategoryFilterButton/CategoryFilterButton";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Components/CategoryFilterButton",
  component: CategoryFilterButton,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "카테고리를 선택할 수 있는 필터 버튼 컴포넌트입니다.",
      },
    },
    backgrounds: {
      default: "dark",
    },
  },
  argTypes: {
    isSelected: {
      control: "boolean",
      description: "선택된 상태 여부",
    },
    children: {
      control: "text",
      description: "버튼에 표시될 텍스트",
    },
  },
  decorators: [
    (Story) => (
      <div className="dark" style={{ padding: "20px", background: "#0b0f0e" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CategoryFilterButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isSelected: false,
    children: "카테고리",
  },
};

export const Selected: Story = {
  args: {
    isSelected: true,
    children: "카테고리",
  },
};

export const AllStates: Story = {
  args: {
    children: "카테고리",
  },
  render: () => (
    <div className="flex flex-wrap gap-4">
      <CategoryFilterButton isSelected={false}>기본 상태</CategoryFilterButton>
      <CategoryFilterButton isSelected={true}>선택된 상태</CategoryFilterButton>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "기본 상태와 선택된 상태를 비교합니다.",
      },
    },
  },
};

export const CategoryList: Story = {
  args: {
    children: "카테고리",
  },
  render: () => (
    <div className="flex flex-wrap gap-2">
      <CategoryFilterButton isSelected={true}>전체</CategoryFilterButton>
      <CategoryFilterButton isSelected={false}>개발</CategoryFilterButton>
      <CategoryFilterButton isSelected={false}>디자인</CategoryFilterButton>
      <CategoryFilterButton isSelected={false}>기획</CategoryFilterButton>
      <CategoryFilterButton isSelected={false}>마케팅</CategoryFilterButton>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "카테고리 필터 버튼 그룹 예시입니다.",
      },
    },
  },
};
