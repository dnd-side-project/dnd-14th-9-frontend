import { Avatar } from "./Avatar";

// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Components/Avatar",
  component: Avatar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "radio",
      options: ["xlarge", "large", "medium", "small"],
    },
    type: {
      control: "radio",
      options: ["image", "empty"],
    },
    edit: {
      control: "boolean",
    },
    src: {
      control: "text",
    },
  },
  args: {
    src: "https://github.com/shadcn.png",
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    type: "empty",
    size: "xlarge",
  },
};

export const Image: Story = {
  args: {
    type: "image",
    size: "xlarge",
    src: "https://github.com/shadcn.png",
  },
};

export const Edit: Story = {
  args: {
    type: "image",
    size: "xlarge",
    edit: true,
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-end gap-4">
      <Avatar {...args} size="xlarge" />
      <Avatar {...args} size="large" />
      <Avatar {...args} size="medium" />
      <Avatar {...args} size="small" />
    </div>
  ),
  args: {
    type: "empty",
  },
};
