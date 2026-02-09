import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Badge } from "@/components/Badge/Badge";
import { ChipGroup } from "@/components/ChipGroup/ChipGroup";

const meta = {
  title: "Components/ChipGroup",
  component: ChipGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "여러 개의 Chip(Badge)을 가로로 정렬하고 레이아웃을 관리하는 컨테이너 컴포넌트입니다. 최대 4개까지 정렬 가능합니다.",
      },
    },
    backgrounds: {
      default: "dark",
    },
  },
  decorators: [
    (Story) => (
      <div className="dark" style={{ padding: "20px", background: "#0b0f0e" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChipGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: null,
  },
  render: () => (
    <ChipGroup>
      <Badge status="recruiting">모집중</Badge>
      <Badge status="inProgress">진행중</Badge>
    </ChipGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: "기본 ChipGroup 사용 예시입니다.",
      },
    },
  },
};

export const AllStatuses: Story = {
  args: {
    children: null,
  },
  render: () => (
    <ChipGroup>
      <Badge status="recruiting">모집중</Badge>
      <Badge status="closing">마감 임박</Badge>
      <Badge status="inProgress">진행중</Badge>
      <Badge status="closed">마감</Badge>
    </ChipGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: "4개의 Badge를 모두 포함한 ChipGroup입니다.",
      },
    },
  },
};

export const MaxFourChips: Story = {
  args: {
    children: null,
  },
  render: () => (
    <ChipGroup>
      <Badge status="recruiting">1번</Badge>
      <Badge status="closing">2번</Badge>
      <Badge status="inProgress">3번</Badge>
      <Badge status="closed">4번</Badge>
      <Badge status="recruiting">5번 (표시 안됨)</Badge>
      <Badge status="recruiting">6번 (표시 안됨)</Badge>
    </ChipGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: "6개의 Badge를 전달해도 최대 4개만 렌더링됩니다.",
      },
    },
  },
};

export const DifferentSizes: Story = {
  args: {
    children: null,
  },
  render: () => (
    <ChipGroup>
      <Badge status="recruiting" radius="max">
        Pill
      </Badge>
      <Badge status="inProgress" radius="xs">
        Rounded
      </Badge>
    </ChipGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: "Chip의 크기/스타일은 하위 Badge 컴포넌트에서 직접 제어합니다.",
      },
    },
  },
};
