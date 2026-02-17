"use client";

import { useState } from "react";

import { Stepper } from "./Stepper";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const META = {
  title: "Components/Stepper",
  component: Stepper,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    label: {
      control: "text",
    },
    hint: {
      control: "text",
    },
    value: {
      control: "number",
    },
    min: {
      control: "number",
    },
    max: {
      control: "number",
    },
    step: {
      control: "number",
    },
    disabled: {
      control: "boolean",
    },
  },
  args: {
    label: "참여인원",
    hint: "최대 10명까지 가능",
    min: 1,
    max: 10,
    step: 1,
    disabled: false,
  },
} satisfies Meta<typeof Stepper>;

export default META;
type Story = StoryObj<typeof META>;

// 참여인원 스테퍼 (1명 단위)
export const PARTICIPANTS: Story = {
  render: function ParticipantsStory(args) {
    const [value, setValue] = useState(5);
    return <Stepper {...args} value={value} onChange={setValue} formatDisplay={(v) => `${v}명`} />;
  },
  args: {
    label: "참여인원",
    hint: "최대 10명까지 가능",
    min: 1,
    max: 10,
    step: 1,
  },
};

// 진행시간 스테퍼 (5분 단위)
export const DURATION: Story = {
  render: function DurationStory(args) {
    const [value, setValue] = useState(90);

    const formatDuration = (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      if (hours > 0 && mins > 0) {
        return `${hours}시간 ${mins}분`;
      }
      if (hours > 0) {
        return `${hours}시간`;
      }
      return `${mins}분`;
    };

    return <Stepper {...args} value={value} onChange={setValue} formatDisplay={formatDuration} />;
  },
  args: {
    label: "진행시간",
    hint: "5분 단위로 설정",
    min: 30,
    max: 480,
    step: 5,
  },
};

// 비활성화 상태
export const DISABLED: Story = {
  render: function DisabledStory(args) {
    const [value, setValue] = useState(5);
    return <Stepper {...args} value={value} onChange={setValue} formatDisplay={(v) => `${v}명`} />;
  },
  args: {
    label: "참여인원",
    hint: "최대 10명까지 가능",
    min: 1,
    max: 10,
    step: 1,
    disabled: true,
  },
};

// 최소값 도달 상태
export const AT_MINIMUM: Story = {
  render: function AtMinimumStory(args) {
    const [value, setValue] = useState(1);
    return <Stepper {...args} value={value} onChange={setValue} formatDisplay={(v) => `${v}명`} />;
  },
  args: {
    label: "참여인원",
    hint: "최대 10명까지 가능",
    min: 1,
    max: 10,
    step: 1,
  },
};

// 최대값 도달 상태
export const AT_MAXIMUM: Story = {
  render: function AtMaximumStory(args) {
    const [value, setValue] = useState(10);
    return <Stepper {...args} value={value} onChange={setValue} formatDisplay={(v) => `${v}명`} />;
  },
  args: {
    label: "참여인원",
    hint: "최대 10명까지 가능",
    min: 1,
    max: 10,
    step: 1,
  },
};

// 힌트 없는 버전
export const WITHOUT_HINT: Story = {
  render: function WithoutHintStory(args) {
    const [value, setValue] = useState(5);
    return <Stepper {...args} value={value} onChange={setValue} formatDisplay={(v) => `${v}명`} />;
  },
  args: {
    label: "참여인원",
    min: 1,
    max: 10,
    step: 1,
  },
};
