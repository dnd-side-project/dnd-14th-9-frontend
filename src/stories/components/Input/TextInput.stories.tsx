import { useState } from "react";

import { TextInput } from "@/components/Input/TextInput";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

/**
 * \`TextInput\` 컴포넌트는 모든 텍스트 기반 입력에 사용되는 공통 폼 필드입니다.
 * 피그마 디자인 시스템에 맞춰 다양한 상태(Default, Filled, Focused, Error, Disabled)와
 * HelperText, Clear(X) 버튼 기능, 글자 수 세기 기능 등을 포함합니다.
 */
const meta: Meta<typeof TextInput> = {
  title: "Components/Input/TextInput",
  component: TextInput,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
    },
    docs: {
      description: {
        component:
          "상태별 테두리 및 배경색 처리, 클리어 버튼 조건부 렌더링 등이 적용된 TextInput 컴포넌트입니다.",
      },
    },
  },
  args: {
    size: "md",
    fullWidth: false,
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
type Story = StoryObj<typeof TextInput>;

// 기본 상태
export const Default: Story = {
  args: {
    placeholder: "텍스트를 입력해주세요",
  },
};

// 라벨 추가
export const WithLabel: Story = {
  args: {
    label: "이메일",
    placeholder: "example@email.com",
  },
};

// 포커스/클리어 버튼 확인을 위한 제어형 스토리
export const InteractiveControlled: Story = {
  render: (args) => {
    const [value, setValue] = useState("입력된 내용이 있습니다");
    return (
      <TextInput
        {...args}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onClear={() => setValue("")}
      />
    );
  },
  args: {
    label: "인터랙티브 테스트 (포커스해보세요)",
    placeholder: "포커스 시 X 버튼이 나타납니다.",
  },
  parameters: {
    docs: {
      description: {
        story: "값이 입력되어 있고 인풋이 Focus된 상태일 때만 우측에 Clear(X) 버튼이 표시됩니다.",
      },
    },
  },
};

// 에러 상태와 에러 메시지
export const ErrorState: Story = {
  args: {
    label: "비밀번호",
    type: "password",
    defaultValue: "wrongpassword",
    error: true,
    errorMessage: "비밀번호가 일치하지 않습니다.",
  },
};

// 일반 Helper Text
export const WithHelperText: Story = {
  args: {
    label: "닉네임",
    defaultValue: "JohnDoe",
    helperText: "닉네임은 특수문자 제외 2~10자 이내입니다.",
    helperTextType: "default",
  },
};

// 글자 수 제한 표시
export const WithCharacterCount: Story = {
  render: (args) => {
    const [value, setValue] = useState("현재 입력된 텍스트");
    return <TextInput {...args} value={value} onChange={(e) => setValue(e.target.value)} />;
  },
  args: {
    label: "자기소개 (짧게)",
    maxLength: 30,
    showCharacterCount: true,
  },
};

// 사이즈 구분 (sm)
export const SmallSize: Story = {
  args: {
    size: "sm",
    label: "작은 사이즈 인풋 (sm)",
    placeholder: "높이가 44px로 렌더링됩니다",
  },
};

// 비활성화 상태
export const Disabled: Story = {
  args: {
    label: "비활성화 상태",
    placeholder: "이 필드는 수정할 수 없습니다.",
    defaultValue: "수정 불가 텍스트",
    disabled: true,
  },
};

// 컴포넌트 상태 종합 모음
export const AllStatesShowcase: Story = {
  render: () => (
    <div className="flex w-full flex-col gap-8">
      <TextInput label="1. 기본 (Default)" placeholder="포커스와 내용을 입력해보세요" />

      <TextInput
        label="2. 채워짐 (Filled - Not Focused)"
        defaultValue="이미 입력된 텍스트 (클릭해서 포커스 확인)"
      />

      <TextInput
        label="3. 에러 (Error)"
        defaultValue="잘못된 이메일"
        error={true}
        errorMessage="올바른 이메일 형식이 아닙니다."
      />

      <TextInput
        label="4. 비활성화 (Disabled)"
        defaultValue="사용자 아이디 (수정불가)"
        disabled={true}
      />

      <TextInput size="sm" label="5. 작은 사이즈 (Small)" placeholder="작은 영역용 인풋" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "모든 디자인 토큰 상태가 제대로 적용되었는지 확인하는 쇼케이스입니다.",
      },
    },
  },
};
