import { Toast } from "@/components/Toast/Toast";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const onClose = () => undefined;

const meta = {
  title: "Components/Toast",
  component: Toast,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
    },
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseArgs = {
  id: "toast-story",
  duration: 60_000,
  onClose,
  title: "저장되었습니다.",
  description: "변경 사항이 반영되었습니다.",
};

export const Info: Story = {
  args: { ...baseArgs, type: "info" },
};

export const Success: Story = {
  args: { ...baseArgs, type: "success" },
};

export const Warning: Story = {
  args: { ...baseArgs, type: "warning" },
};

export const Error: Story = {
  args: { ...baseArgs, type: "error" },
};

export const AllStates: Story = {
  args: { ...baseArgs, type: "info" },
  render: () => (
    <div className="flex w-[400px] max-w-full flex-col gap-4">
      <Toast {...baseArgs} id="toast-info" type="info" />
      <Toast {...baseArgs} id="toast-success" type="success" />
      <Toast {...baseArgs} id="toast-warning" type="warning" />
      <Toast {...baseArgs} id="toast-error" type="error" />
    </div>
  ),
};

export const TitleOnly: Story = {
  args: { ...baseArgs, type: "success", description: undefined },
};

export const WithoutClose: Story = {
  args: { ...baseArgs, type: "info", showClose: false },
};

export const Mobile: Story = {
  args: { ...baseArgs, type: "warning" },
  render: (args) => (
    <div className="w-[320px] max-w-full">
      <Toast {...args} />
    </div>
  ),
};
