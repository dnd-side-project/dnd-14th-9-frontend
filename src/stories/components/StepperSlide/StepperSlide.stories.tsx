import { useState } from "react";

import { StepperSlide } from "@/components/StepperSlide/StepperSlide";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Components/StepperSlide",
  component: StepperSlide,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "드래그 및 클릭으로 값을 조절할 수 있는 슬라이더 컴포넌트입니다. 10단위 격자와 20단위 숫자를 표시하며, 현재 값과 내 집중도를 말풍선으로 표시합니다.",
      },
    },
    backgrounds: {
      default: "dark",
    },
  },
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "현재 값 (0-100)",
    },
    myFocusValue: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "내 집중도 마커 위치",
    },
    disabled: {
      control: "boolean",
      description: "비활성화 상태",
    },
    onChange: {
      action: "changed",
      description: "값이 변경될 때 호출되는 콜백",
    },
  },
  decorators: [
    (Story) => (
      <div className="dark w-80" style={{ padding: "40px", background: "#0b0f0e" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StepperSlide>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 50,
    onChange: () => {},
  },
  render: () => {
    const [value, setValue] = useState(50);
    return <StepperSlide value={value} onChange={setValue} />;
  },
};

export const WithMyFocus: Story = {
  args: {
    value: 70,
    onChange: () => {},
    myFocusValue: 40,
  },
  render: () => {
    const [value, setValue] = useState(70);
    return <StepperSlide value={value} onChange={setValue} myFocusValue={40} />;
  },
  parameters: {
    docs: {
      description: {
        story: "'내 집중도' 마커가 표시된 상태입니다.",
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    value: 50,
    onChange: () => {},
    disabled: true,
  },
  render: () => {
    const [value, setValue] = useState(50);
    return <StepperSlide value={value} onChange={setValue} disabled />;
  },
  parameters: {
    docs: {
      description: {
        story: "비활성화된 상태의 슬라이더입니다.",
      },
    },
  },
};

export const WithValueDisplay: Story = {
  args: {
    value: 30,
    onChange: () => {},
    myFocusValue: 60,
  },
  render: () => {
    const [value, setValue] = useState(30);
    return (
      <div className="flex flex-col gap-4">
        <StepperSlide value={value} onChange={setValue} myFocusValue={60} />
        <p className="text-sm text-gray-300">현재 값: {value}%</p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "현재 값을 하단에 표시하는 예시입니다.",
      },
    },
  },
};

export const OnLightBackground: Story = {
  args: {
    value: 50,
    onChange: () => {},
    myFocusValue: 30,
  },
  render: () => {
    const [value, setValue] = useState(50);
    return <StepperSlide value={value} onChange={setValue} myFocusValue={30} />;
  },
  decorators: [
    (Story) => (
      <div className="w-80" style={{ padding: "40px", background: "#ffffff" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    backgrounds: {
      default: "light",
    },
    docs: {
      description: {
        story: "하얀 배경에서의 슬라이더 예시입니다.",
      },
    },
  },
};

export const FullWidth474: Story = {
  args: {
    value: 50,
    onChange: () => {},
    myFocusValue: 40,
  },
  render: () => {
    const [value, setValue] = useState(50);
    return <StepperSlide value={value} onChange={setValue} myFocusValue={40} />;
  },
  decorators: [
    (Story) => (
      <div className="dark" style={{ width: "474px", padding: "40px", background: "#0b0f0e" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    backgrounds: {
      default: "dark",
    },
    docs: {
      description: {
        story: "전체 너비 474px에서의 슬라이더 예시입니다.",
      },
    },
  },
};
