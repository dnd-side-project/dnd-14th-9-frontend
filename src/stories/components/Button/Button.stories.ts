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
    docs: {
      description: {
        component:
          "다양한 상황에서 사용할 수 있는 반응형 버튼 컴포넌트입니다. 4가지 variant(primary, secondary, tertiary, text)와 5가지 size(xlarge, large, medium, small, xsmall)를 지원합니다.",
      },
    },
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
export const IconOnlySecondary: Story = {
  args: {
    iconOnly: true,
    leftIcon: createElement(Search, { size: 24 }),
    size: "medium",
    variant: "secondary",
  },
};

export const IconOnlyTertiary: Story = {
  args: {
    iconOnly: true,
    leftIcon: createElement(X, { size: 24 }),
    size: "medium",
    variant: "tertiary",
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
