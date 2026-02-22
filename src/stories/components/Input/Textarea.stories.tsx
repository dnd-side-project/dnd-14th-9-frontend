import { useState } from "react";

import { Textarea } from "@/components/Input/Textarea";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

/**
 * \`Textarea\` 컴포넌트는 여러 줄의 텍스트를 입력받기 위한 폼 필드입니다.
 * \`TextInput\`과 마찬가지로 피그마 디자인 기반 상태 토큰을 사용하며,
 * 글자 수 제한, 에러 상태, HelperText 표현 능력을 갖추고 있습니다.
 */
const meta: Meta<typeof Textarea> = {
  title: "Components/Input/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
    },
  },
  args: {
    size: "medium",
    disabled: false,
    error: false,
  },
  decorators: [
    (Story) => (
      <div
        className="dark flex w-[420px] flex-col rounded-md p-5"
        style={{ background: "#0b0f0e" }}
      >
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Textarea>;

// 기본 상태
export const Default: Story = {
  args: {
    placeholder: "내용을 입력해주세요.",
  },
};

// 라벨 추가
export const WithLabel: Story = {
  args: {
    label: "게시글 내용",
    placeholder: "이곳에 다양한 생각들을 작성해주세요...",
  },
};

// 제어형 스토리 (상태 업데이트 확인)
export const InteractiveControlled: Story = {
  render: (args) => {
    const [value, setValue] = useState("안녕! 여러 줄을\n입력해 보세요.");
    return <Textarea {...args} value={value} onChange={(e) => setValue(e.target.value)} />;
  },
  args: {
    label: "자기소개 (상태 제어)",
  },
};

// 에러 상태와 에러 메시지
export const ErrorState: Story = {
  args: {
    label: "피드백 내용",
    defaultValue: "내용이 너무 짧습니다.",
    error: true,
    errorMessage: "피드백은 최소 10자 이상 입력해야 합니다.",
  },
};

// 일반 Helper Text
export const WithHelperText: Story = {
  args: {
    label: "방 한 줄 소개",
    helperText: "참여자들이 방의 목표를 쉽게 알 수 있도록 소개를 적어주세요.",
    helperTextType: "default",
  },
};

// 글자 수 제한 표시
export const WithCharacterCount: Story = {
  render: (args) => {
    const [value, setValue] = useState("");
    return <Textarea {...args} value={value} onChange={(e) => setValue(e.target.value)} />;
  },
  args: {
    label: "목표 상세 (글자 수 제한 가능)",
    placeholder: "최대 100자까지 작성할 수 있습니다.",
    maxLength: 100,
    showCharacterCount: true,
  },
};

// 사이즈 구분 (small)
export const SmallSize: Story = {
  args: {
    size: "small",
    label: "작은 사이즈 Textarea (small)",
    placeholder: "높이가 87px 이상으로 렌더링됩니다.",
  },
};

// 비활성화 상태
export const Disabled: Story = {
  args: {
    label: "모임 상세 규칙 (비활성화)",
    defaultValue: "1. 상호 존중\n2. 주 3회 이상 참여 필수\n(수정할 수 없는 항목입니다.)",
    disabled: true,
  },
};

// 컴포넌트 상태 종합 모음
export const AllStatesShowcase: Story = {
  render: () => (
    <div className="flex w-full flex-col gap-8">
      <Textarea label="1. 기본 (Default)" placeholder="텍스트를 자유롭게 입력하세요" />

      <Textarea
        label="2. 에러 및 글자수 표시 (Error & Limit)"
        defaultValue="이 내용은 매우 깁니다..."
        error={true}
        errorMessage="내용에 비속어가 포함되어 있습니다."
        maxLength={300}
        showCharacterCount={true}
      />

      <Textarea
        label="3. 비활성화 (Disabled)"
        defaultValue="과거에 작성한 일기입니다."
        disabled={true}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "다양한 설정 값을 한곳에 모아둔 쇼케이스 화면입니다.",
      },
    },
  },
};
