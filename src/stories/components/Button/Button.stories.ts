import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Heart, Settings, Search, X } from "lucide-react";
import { createElement } from "react";

import { Button } from "@/components/Button/Button";
import { PlusIcon } from "@/components/Icon/PlusIcon";

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "tertiary", "text"],
    },
    size: {
      control: "select",
      options: ["xlarge", "large", "medium", "small", "xsmall"],
    },
    iconOnly: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Variant Stories
export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Primary",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary",
  },
};

export const Tertiary: Story = {
  args: {
    variant: "tertiary",
    children: "Tertiary",
  },
};

export const Text: Story = {
  args: {
    variant: "text",
    children: "Text Only",
  },
};

// Size Stories
export const XLarge: Story = {
  args: {
    size: "xlarge",
    children: "XLarge",
  },
};

export const Large: Story = {
  args: {
    size: "large",
    children: "Large",
  },
};

export const Medium: Story = {
  args: {
    size: "medium",
    children: "Medium",
  },
};

export const Small: Story = {
  args: {
    size: "small",
    children: "Small",
  },
};

export const XSmall: Story = {
  args: {
    size: "xsmall",
    children: "XSmall",
  },
};

// Disabled States
export const PrimaryDisabled: Story = {
  args: {
    variant: "primary",
    children: "Disabled",
    disabled: true,
  },
};

export const TertiaryDisabled: Story = {
  args: {
    variant: "tertiary",
    children: "Disabled",
    disabled: true,
  },
};

// Icon Only Stories
export const IconOnly: Story = {
  args: {
    iconOnly: true,
    icon: createElement(PlusIcon, { size: "medium" }),
    size: "medium",
  },
};

export const IconOnlySmall: Story = {
  args: {
    iconOnly: true,
    icon: createElement(Heart, { size: 20 }),
    size: "small",
  },
};

export const IconOnlyXLarge: Story = {
  args: {
    iconOnly: true,
    icon: createElement(Settings, { size: 32 }),
    size: "xlarge",
  },
};

// Icon Only with different variants
export const IconOnlySecondary: Story = {
  args: {
    iconOnly: true,
    icon: createElement(Search, { size: 24 }),
    size: "medium",
    variant: "secondary",
  },
};

export const IconOnlyTertiary: Story = {
  args: {
    iconOnly: true,
    icon: createElement(X, { size: 24 }),
    size: "medium",
    variant: "tertiary",
  },
};

export const IconOnlyDisabled: Story = {
  args: {
    iconOnly: true,
    icon: createElement(PlusIcon, { size: "medium" }),
    size: "medium",
    disabled: true,
  },
};
