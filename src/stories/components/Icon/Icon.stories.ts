import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Plus, Heart, Settings, Search, X, Star, User, Home } from "lucide-react";
import { createElement } from "react";

import { Icon } from "@/components/Icon/Icon";

const meta = {
  title: "Components/Icon",
  component: Icon,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    size: {
      control: "select",
      options: ["xlarge", "large", "medium", "small", "xsmall"],
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

// Size Stories
export const XLarge: Story = {
  args: {
    size: "xlarge",
    svg: createElement(Star, { className: "h-full w-full" }),
  },
};

export const Large: Story = {
  args: {
    size: "large",
    svg: createElement(Heart, { className: "h-full w-full" }),
  },
};

export const Medium: Story = {
  args: {
    size: "medium",
    svg: createElement(Plus, { className: "h-full w-full" }),
  },
};

export const Small: Story = {
  args: {
    size: "small",
    svg: createElement(Search, { className: "h-full w-full" }),
  },
};

export const XSmall: Story = {
  args: {
    size: "xsmall",
    svg: createElement(X, { className: "h-full w-full" }),
  },
};

// Various Icons
export const HomeIcon: Story = {
  args: {
    size: "medium",
    svg: createElement(Home, { className: "h-full w-full" }),
  },
};

export const UserIcon: Story = {
  args: {
    size: "medium",
    svg: createElement(User, { className: "h-full w-full" }),
  },
};

export const SettingsIcon: Story = {
  args: {
    size: "medium",
    svg: createElement(Settings, { className: "h-full w-full" }),
  },
};
