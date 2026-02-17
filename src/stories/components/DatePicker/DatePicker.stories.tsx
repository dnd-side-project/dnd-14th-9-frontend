import { useState } from "react";

import { DatePicker } from "@/components/DatePicker/DatePicker";
import type { DateRange, DatePickerRangeProps } from "@/components/DatePicker/DatePicker.types";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<DatePickerRangeProps> = {
  title: "Components/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "날짜 범위 또는 단일 날짜를 선택할 수 있는 DatePicker 컴포넌트입니다. 월별 뷰로 달력을 표시하며, 이전/다음 월 네비게이션을 지원합니다.",
      },
    },
    backgrounds: {
      default: "dark",
    },
  },
  argTypes: {
    disabled: {
      control: "boolean",
      description: "비활성화 상태",
    },
  },
  decorators: [
    (Story) => (
      <div className="dark" style={{ padding: "20px", background: "#0b0f0e" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<DatePickerRangeProps>;

export const Default: Story = {
  args: {
    mode: "range",
  },
};

export const Controlled: Story = {
  args: {
    mode: "range",
  },
  render: function ControlledStory() {
    const [range, setRange] = useState<DateRange>({
      startDate: null,
      endDate: null,
    });

    return (
      <div className="flex flex-col gap-4">
        <DatePicker mode="range" value={range} onChange={setRange} />
        <div className="text-text-secondary text-sm">
          <p>시작일: {range.startDate?.toLocaleDateString() ?? "선택 안됨"}</p>
          <p>종료일: {range.endDate?.toLocaleDateString() ?? "선택 안됨"}</p>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Controlled 모드로 사용하는 예시입니다. 선택된 날짜 범위가 하단에 표시됩니다.",
      },
    },
  },
};

export const WithDefaultValue: Story = {
  args: {
    mode: "range",
    defaultValue: {
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  },
  parameters: {
    docs: {
      description: {
        story: "기본값이 설정된 상태입니다. 오늘부터 7일 후까지 선택되어 있습니다.",
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    mode: "range",
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: "비활성화된 상태의 DatePicker입니다.",
      },
    },
  },
};

export const SingleMode: Story = {
  args: {
    mode: "range",
  },
  render: function SingleModeStory() {
    const [date, setDate] = useState<Date | null>(null);

    return (
      <div className="flex flex-col gap-4">
        <DatePicker mode="single" value={date} onChange={setDate} />
        <div className="text-text-secondary text-sm">
          <p>선택된 날짜: {date?.toLocaleDateString() ?? "선택 안됨"}</p>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "단일 날짜 선택 모드입니다.",
      },
    },
  },
};

export const SingleWithTimePicker: Story = {
  args: {
    mode: "range",
  },
  render: function SingleWithTimePickerStory() {
    const [date, setDate] = useState<Date | null>(null);

    return (
      <div className="flex flex-col gap-4">
        <DatePicker mode="single" showTimePicker value={date} onChange={setDate} />
        <div className="text-text-secondary text-sm">
          <p>선택된 날짜/시간: {date?.toLocaleString() ?? "선택 안됨"}</p>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "단일 날짜 + 시간 선택 모드입니다.",
      },
    },
  },
};
