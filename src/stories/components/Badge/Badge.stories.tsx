import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Badge } from "@/components/Badge/Badge";

const meta = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "콘텐츠의 상태나 속성을 시각적으로 강조하기 위한 Badge 컴포넌트입니다.",
      },
    },
    backgrounds: {
      default: "dark",
    },
  },
  argTypes: {
    status: {
      control: "select",
      options: ["recruiting", "closing", "inProgress", "closed"],
      description: "Badge의 상태",
    },
    radius: {
      control: "select",
      options: ["max", "xs"],
      description: "Badge의 모서리 둥글기",
    },
    children: {
      control: "text",
      description: "Badge에 표시될 텍스트",
    },
  },
  decorators: [
    (Story) => (
      <div className="dark" style={{ padding: "20px", background: "#0b0f0e" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Recruiting: Story = {
  args: {
    status: "recruiting",
    children: "모집중",
  },
};

export const Closing: Story = {
  args: {
    status: "closing",
    children: "마감 임박",
  },
};

export const InProgress: Story = {
  args: {
    status: "inProgress",
    children: "진행중",
  },
};

export const Closed: Story = {
  args: {
    status: "closed",
    children: "마감",
  },
};

export const RadiusMax: Story = {
  args: {
    status: "recruiting",
    radius: "max",
    children: "Pill Shape",
  },
  parameters: {
    docs: {
      description: {
        story: "radius='max' (999px) - 알약 형태의 둥근 모서리",
      },
    },
  },
};

export const RadiusXs: Story = {
  args: {
    status: "recruiting",
    radius: "xs",
    children: "Rounded 4px",
  },
  parameters: {
    docs: {
      description: {
        story: "radius='xs' (4px) - 약간 둥근 모서리",
      },
    },
  },
};

export const AllStatuses: Story = {
  args: {
    children: "모집중",
  },
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge status="recruiting">모집중</Badge>
      <Badge status="closing">마감 임박</Badge>
      <Badge status="inProgress">진행중</Badge>
      <Badge status="closed">마감</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "모든 상태를 한눈에 비교합니다.",
      },
    },
  },
};

export const AllRadii: Story = {
  args: {
    children: "Badge",
  },
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge radius="max">Pill (max)</Badge>
      <Badge radius="xs">Rounded (xs)</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "모든 radius 옵션을 비교합니다.",
      },
    },
  },
};
