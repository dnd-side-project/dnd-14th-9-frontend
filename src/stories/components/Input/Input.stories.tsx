import { useState } from "react";

import { Input } from "@/components/Input/Input";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "다양한 상태를 지원하는 공통 Input 컴포넌트입니다. 레이블, 에러 상태, Clear 버튼 기능을 제공합니다.",
      },
    },
    backgrounds: {
      default: "dark",
    },
  },
  argTypes: {
    label: {
      control: "text",
      description: "입력 필드 상단에 표시되는 레이블",
    },
    placeholder: {
      control: "text",
      description: "플레이스홀더 텍스트",
    },
    error: {
      control: "boolean",
      description: "에러 상태 여부",
    },
    errorMessage: {
      control: "text",
      description: "에러 메시지 (error=true일 때 표시)",
    },
    disabled: {
      control: "boolean",
      description: "비활성화 상태",
    },
    onClear: {
      action: "cleared",
      description: "Clear 버튼 클릭 시 호출되는 콜백",
    },
    maxLength: {
      control: "number",
      description: "입력 가능한 최대 글자 수",
    },
    showCharacterCount: {
      control: "boolean",
      description: "글자 수 표시 여부 (maxLength와 함께 사용)",
    },
  },
  decorators: [
    (Story) => (
      <div className="dark" style={{ padding: "20px", background: "#0b0f0e", width: "420px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "텍스트를 입력하세요",
  },
};

export const WithLabel: Story = {
  args: {
    label: "이메일",
    placeholder: "이메일을 입력하세요",
  },
};

export const Filled: Story = {
  args: {
    placeholder: "텍스트를 입력하세요",
    defaultValue: "입력된 텍스트",
  },
};

export const FocusedWithClear: Story = {
  render: (args) => {
    const [value, setValue] = useState("입력된 텍스트");
    return (
      <Input
        {...args}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onClear={() => setValue("")}
      />
    );
  },
  args: {
    placeholder: "텍스트를 입력하세요",
    label: "Focus 상태 (클릭해보세요)",
  },
  parameters: {
    docs: {
      description: {
        story: "Input에 포커스하면 Clear 버튼이 나타납니다.",
      },
    },
  },
};

export const Error: Story = {
  args: {
    label: "이메일",
    placeholder: "이메일을 입력하세요",
    defaultValue: "invalid-email",
    error: true,
    errorMessage: "올바른 이메일 형식을 입력해주세요.",
  },
};

export const Disabled: Story = {
  args: {
    label: "비활성화됨",
    placeholder: "입력할 수 없습니다",
    disabled: true,
  },
};

export const DisabledWithValue: Story = {
  args: {
    label: "비활성화됨",
    defaultValue: "비활성화된 입력값",
    disabled: true,
  },
};

export const WithMaxLength: Story = {
  args: {
    label: "닉네임",
    placeholder: "닉네임을 입력하세요",
    maxLength: 10,
  },
  parameters: {
    docs: {
      description: {
        story: "최대 글자 수가 제한된 Input입니다. (최대 10자)",
      },
    },
  },
};

export const WithCharacterCount: Story = {
  render: (args) => {
    const [value, setValue] = useState("");
    return (
      <Input
        {...args}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onClear={() => setValue("")}
      />
    );
  },
  args: {
    label: "방 이름*",
    placeholder: "예) 아침코딩모각작",
    maxLength: 20,
    showCharacterCount: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "글자 수를 실시간으로 표시하는 Input입니다. maxLength와 showCharacterCount를 함께 사용합니다.",
      },
    },
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Input placeholder="Default 상태" />
      <Input placeholder="Filled 상태" defaultValue="입력된 값" />
      <Input
        placeholder="Error 상태"
        defaultValue="잘못된 입력"
        error
        errorMessage="에러 메시지입니다"
      />
      <Input placeholder="Disabled 상태" disabled />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Input 컴포넌트의 모든 상태를 한눈에 비교합니다.",
      },
    },
  },
};
