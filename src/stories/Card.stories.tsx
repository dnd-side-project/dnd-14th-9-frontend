import { Card } from "@/components/Card/Card";
import type { CardProps } from "@/components/Card/Card";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const baseArgs = {
  id: 1,
  title: "Card Title Example",
  author: "Nickname",
  imageUrl: "https://picsum.photos/640/360",
  currentMembers: 6,
  maxMembers: 10,
  timeLeft: "60분",
  date: "02/01 · 오전 10:00",
  category: "카테고리",
  status: "closing",
  statusText: "3일 전",
} satisfies Omit<CardProps, "layout">;

const meta = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
    },
  },
  argTypes: {
    status: {
      control: "select",
      options: ["recruiting", "closing", "inProgress", "closed"],
    },
    layout: {
      control: "inline-radio",
      options: ["vertical", "horizontal"],
      description: "Card layout mode",
    },
  },
  decorators: [
    (Story) => (
      <div className="dark bg-[#0b0f0e] p-5">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ...baseArgs,
  },
  render: (args) => (
    <div className="w-[290px]">
      <Card {...args} />
    </div>
  ),
};

export const Vertical: Story = {
  args: {
    ...baseArgs,
    layout: "vertical",
  },
  render: (args) => (
    <div className="w-[290px]">
      <Card {...args} />
    </div>
  ),
};

export const Horizontal: Story = {
  args: {
    ...baseArgs,
    layout: "horizontal",
  },
  render: (args) => (
    <div className="w-[760px]">
      <Card {...args} />
    </div>
  ),
};

export const StatusVariants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <div className="w-[760px]">
        <Card {...args} layout="horizontal" status="recruiting" statusText="모집중" />
      </div>
      <div className="w-[760px]">
        <Card {...args} layout="horizontal" status="closing" statusText="3일 전" />
      </div>
      <div className="w-[760px]">
        <Card {...args} layout="horizontal" status="inProgress" statusText="진행중" />
      </div>
      <div className="w-[760px]">
        <Card {...args} layout="horizontal" status="closed" statusText="마감" />
      </div>
    </div>
  ),
  args: {
    ...baseArgs,
  },
};
