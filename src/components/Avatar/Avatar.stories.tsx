import { Avatar } from "./Avatar";

// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from "@storybook/react";

const META = {
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

export default META;
type Story = StoryObj<typeof META>;

export const DEFAULT: Story = {
  args: {
    type: "empty",
    size: "xlarge",
  },
};

export const IMAGE: Story = {
  args: {
    type: "image",
    size: "xlarge",
    src: "https://github.com/shadcn.png",
  },
};

export const EDIT: Story = {
  args: {
    type: "image",
    size: "xlarge",
    edit: true,
  },
};

export const SIZES: Story = {
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
