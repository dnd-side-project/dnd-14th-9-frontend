import { useState } from "react";

import { Textarea } from "@/components/Textarea/Textarea";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Components/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "다양한 상태를 지원하는 공통 Textarea 컴포넌트입니다. 레이블, 에러 상태, 글자 수 표시 기능을 제공합니다.",
      },
    },
    backgrounds: {
      default: "dark",
    },
  },
  argTypes: {
    label: { control: "text", description: "텍스트 영역 상단에 표시되는 레이블" },
    placeholder: { control: "text", description: "플레이스홀더 텍스트" },
    error: { control: "boolean", description: "에러 상태 여부" },
    errorMessage: { control: "text", description: "에러 메시지 (error=true일 때 표시)" },
    disabled: { control: "boolean", description: "비활성화 상태" },
    size: {
      control: "select",
      options: ["medium", "small"],
      description: "텍스트 영역 크기",
    },
    showCharacterCount: { control: "boolean", description: "글자 수 표시 여부" },
    maxLength: { control: "number", description: "최대 글자 수" },
  },
  decorators: [
    (Story) => (
      <div className="dark" style={{ padding: "20px", background: "#0b0f0e", width: "420px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "텍스트를 입력하세요",
    size: "medium",
  },
};

export const WithLabel: Story = {
  args: {
    label: "설명",
    placeholder: "내용을 입력하세요",
  },
};

export const WithCharacterCount: Story = {
  args: {
    label: "자기소개",
    placeholder: "자기소개를 입력하세요",
    showCharacterCount: true,
    maxLength: 100,
  },
};

export const SmallSize: Story = {
  args: {
    label: "메모",
    placeholder: "메모를 입력하세요",
    size: "small",
  },
};

export const ErrorState: Story = {
  args: {
    label: "내용",
    placeholder: "내용을 입력하세요",
    defaultValue: "잘못된 입력",
    error: true,
    errorMessage: "필수 항목입니다.",
    showCharacterCount: true,
    maxLength: 100,
  },
};

export const Disabled: Story = {
  args: {
    label: "비활성화됨",
    placeholder: "입력할 수 없습니다",
    disabled: true,
  },
};

export const ControlledWithCharacterCount: Story = {
  render: (args) => {
    const [value, setValue] = useState("");
    return <Textarea {...args} value={value} onChange={(e) => setValue(e.target.value)} />;
  },
  args: {
    label: "프로젝트 설명",
    placeholder: "프로젝트에 대해 설명해주세요",
    showCharacterCount: true,
    maxLength: 100,
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Textarea placeholder="Default 상태" />
      <Textarea placeholder="Filled 상태" defaultValue="입력된 값" />
      <Textarea
        placeholder="Error 상태"
        defaultValue="잘못된 입력"
        error
        errorMessage="에러 메시지입니다"
        showCharacterCount
        maxLength={100}
      />
      <Textarea placeholder="Disabled 상태" disabled />
    </div>
  ),
};

export const BothSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Textarea label="Medium (98px)" placeholder="Medium 사이즈" size="medium" />
      <Textarea label="Small (87px)" placeholder="Small 사이즈" size="small" />
    </div>
  ),
};
