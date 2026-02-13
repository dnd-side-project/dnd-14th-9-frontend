import { createElement } from "react";

import { Heart, Settings, Search, X } from "lucide-react";

import { Button } from "@/components/Button/Button";
import { PlusIcon } from "@/components/Icon/PlusIcon";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "다양한 상황에서 사용할 수 있는 반응형 버튼 컴포넌트입니다. 3가지 variant(solid, outlined, ghost)와 colorScheme(primary, secondary, tertiary), 5가지 size(xlarge, large, medium, small, xsmall)를 지원합니다.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["solid", "outlined", "ghost"],
    },
    colorScheme: {
      control: "select",
      options: ["primary", "secondary", "tertiary"],
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
    leftIcon: {
      control: false,
      description: "버튼 왼쪽에 표시될 아이콘",
    },
    rightIcon: {
      control: false,
      description: "버튼 오른쪽에 표시될 아이콘",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// SOLID Variant Stories
export const SolidPrimary: Story = {
  args: {
    variant: "solid",
    colorScheme: "primary",
    children: "Solid Primary",
  },
};

export const SolidSecondary: Story = {
  args: {
    variant: "solid",
    colorScheme: "secondary",
    children: "Solid Secondary",
  },
};

export const SolidTertiary: Story = {
  args: {
    variant: "solid",
    colorScheme: "tertiary",
    children: "Solid Tertiary",
  },
};

// OUTLINED Variant Stories
export const OutlinedPrimary: Story = {
  args: {
    variant: "outlined",
    colorScheme: "primary",
    children: "Outlined Primary",
  },
};

export const OutlinedSecondary: Story = {
  args: {
    variant: "outlined",
    colorScheme: "secondary",
    children: "Outlined Secondary",
  },
};

// GHOST Variant Stories
export const GhostPrimary: Story = {
  args: {
    variant: "ghost",
    colorScheme: "primary",
    children: "Ghost Primary",
  },
};

export const GhostSecondary: Story = {
  args: {
    variant: "ghost",
    colorScheme: "secondary",
    children: "Ghost Secondary",
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
export const SolidDisabled: Story = {
  args: {
    variant: "solid",
    colorScheme: "primary",
    children: "Disabled",
    disabled: true,
  },
};

export const OutlinedDisabled: Story = {
  args: {
    variant: "outlined",
    colorScheme: "primary",
    children: "Disabled",
    disabled: true,
  },
};

export const GhostDisabled: Story = {
  args: {
    variant: "ghost",
    colorScheme: "primary",
    children: "Disabled",
    disabled: true,
  },
};

// Icon Only Stories
export const IconOnly: Story = {
  args: {
    iconOnly: true,
    leftIcon: createElement(PlusIcon, { size: "medium" }),
    size: "medium",
  },
};

export const IconOnlySmall: Story = {
  args: {
    iconOnly: true,
    leftIcon: createElement(Heart, { size: 20 }),
    size: "small",
  },
};

export const IconOnlyXLarge: Story = {
  args: {
    iconOnly: true,
    leftIcon: createElement(Settings, { size: 32 }),
    size: "xlarge",
  },
};

// Icon Only with different variants
export const IconOnlyOutlined: Story = {
  args: {
    iconOnly: true,
    leftIcon: createElement(Search, { size: 24 }),
    size: "medium",
    variant: "outlined",
    colorScheme: "primary",
  },
};

export const IconOnlyGhost: Story = {
  args: {
    iconOnly: true,
    leftIcon: createElement(X, { size: 24 }),
    size: "medium",
    variant: "ghost",
    colorScheme: "primary",
  },
};

export const IconOnlyDisabled: Story = {
  args: {
    iconOnly: true,
    leftIcon: createElement(PlusIcon, { size: "medium" }),
    size: "medium",
    disabled: true,
  },
};

// Icon + Text Stories
export const WithLeftIcon: Story = {
  args: {
    leftIcon: createElement(Heart, { size: 20 }),
    children: "좋아요",
  },
};

export const WithRightIcon: Story = {
  args: {
    rightIcon: createElement(Search, { size: 20 }),
    children: "검색",
  },
};

export const WithBothIcons: Story = {
  args: {
    leftIcon: createElement(Settings, { size: 20 }),
    rightIcon: createElement(X, { size: 20 }),
    children: "설정",
  },
};
