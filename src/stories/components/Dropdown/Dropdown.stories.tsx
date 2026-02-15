import { useState } from "react";

import { Dropdown } from "@/components/Dropdown/Dropdown";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const SAMPLE_OPTIONS = [
  { value: "latest", label: "최신순" },
  { value: "popular", label: "인기순" },
  { value: "price", label: "가격순" },
];

const LONG_OPTIONS = [
  { value: "option1", label: "옵션 1" },
  { value: "option2", label: "옵션 2" },
  { value: "option3", label: "옵션 3" },
  { value: "option4", label: "옵션 4" },
  { value: "option5", label: "옵션 5" },
  { value: "option6", label: "옵션 6" },
  { value: "option7", label: "옵션 7" },
  { value: "option8", label: "옵션 8" },
];

const meta = {
  title: "Components/Dropdown",
  component: Dropdown,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "여러 선택지 중 하나를 선택하는 드롭다운 컴포넌트입니다. Filter 컴포넌트와 통합되어 있으며, 선택 시 체크 아이콘이 표시됩니다.",
      },
    },
    backgrounds: {
      default: "dark",
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["full", "large", "small"],
      description: "드롭다운 크기 (full: 100%, large: 89px, small: 74px)",
    },
    radius: {
      control: "select",
      options: ["max", "sm"],
      description: "모서리 둥글기",
    },
    placeholder: {
      control: "text",
      description: "플레이스홀더 텍스트",
    },
    disabled: {
      control: "boolean",
      description: "비활성화 여부",
    },
  },
  decorators: [
    (Story) => (
      <div className="dark" style={{ padding: "20px", background: "#0b0f0e", minHeight: "300px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    options: SAMPLE_OPTIONS,
    placeholder: "선택",
  },
};

export const WithDefaultValue: Story = {
  args: {
    options: SAMPLE_OPTIONS,
    defaultValue: "popular",
    placeholder: "선택",
  },
  parameters: {
    docs: {
      description: {
        story: "기본 선택값이 설정된 드롭다운입니다.",
      },
    },
  },
};

export const Small: Story = {
  args: {
    options: SAMPLE_OPTIONS,
    size: "small",
    placeholder: "선택",
  },
};

export const RadiusSm: Story = {
  args: {
    options: SAMPLE_OPTIONS,
    radius: "sm",
    placeholder: "선택",
  },
};

export const LongList: Story = {
  args: {
    options: LONG_OPTIONS,
    placeholder: "선택",
  },
  parameters: {
    docs: {
      description: {
        story: "옵션이 많을 경우 최대 높이 224px로 스크롤됩니다.",
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    options: SAMPLE_OPTIONS,
    disabled: true,
    placeholder: "선택",
  },
};

export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState<string | undefined>(undefined);

    return (
      <div className="flex flex-col gap-4">
        <Dropdown {...args} value={value} onChange={setValue} />
        <p className="text-sm text-gray-400">
          선택된 값: <span className="text-text-primary">{value ?? "없음"}</span>
        </p>
      </div>
    );
  },
  args: {
    options: SAMPLE_OPTIONS,
    placeholder: "선택",
  },
  parameters: {
    docs: {
      description: {
        story: "외부에서 상태를 제어하는 Controlled 모드입니다.",
      },
    },
  },
};

export const Large: Story = {
  args: {
    options: SAMPLE_OPTIONS,
    size: "large",
    placeholder: "선택",
  },
};

export const AllVariants: Story = {
  args: {
    options: SAMPLE_OPTIONS,
  },
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-4">
        <span className="w-24 shrink-0 text-sm text-gray-400">Full (반응형)</span>
        <div className="w-90">
          <Dropdown options={SAMPLE_OPTIONS} placeholder="선택" />
        </div>
        <div className="w-90">
          <Dropdown options={SAMPLE_OPTIONS} defaultValue="latest" />
        </div>
      </div>
      <div className="flex items-start gap-4">
        <span className="w-24 shrink-0 text-sm text-gray-400">Large</span>
        <Dropdown options={SAMPLE_OPTIONS} size="large" placeholder="선택" />
        <Dropdown options={SAMPLE_OPTIONS} size="large" defaultValue="latest" />
      </div>
      <div className="flex items-start gap-4">
        <span className="w-24 shrink-0 text-sm text-gray-400">Small</span>
        <Dropdown options={SAMPLE_OPTIONS} size="small" placeholder="선택" />
        <Dropdown options={SAMPLE_OPTIONS} size="small" defaultValue="latest" />
      </div>
      <div className="flex items-start gap-4">
        <span className="w-24 shrink-0 text-sm text-gray-400">Radius SM</span>
        <div className="w-90">
          <Dropdown options={SAMPLE_OPTIONS} radius="sm" placeholder="선택" />
        </div>
        <div className="w-90">
          <Dropdown options={SAMPLE_OPTIONS} radius="sm" defaultValue="latest" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Dropdown 컴포넌트의 모든 변형을 한눈에 비교합니다. Full 크기는 부모 컨테이너 너비에 맞춰집니다.",
      },
    },
  },
};
