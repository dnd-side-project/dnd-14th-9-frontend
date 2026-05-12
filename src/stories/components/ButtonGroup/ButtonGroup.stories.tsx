import { Button } from "@/components/Button/Button";
import { ButtonGroup } from "@/components/ButtonGroup/ButtonGroup";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Components/ButtonGroup",
  component: ButtonGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "여러 개의 Button을 Figma Button/ButtonGroup의 layout, horizontal 속성에 맞춰 정렬·관리하기 위한 컨테이너 컴포넌트입니다. `layout`은 `horizontal={false}`인 세로 배치에서만 적용됩니다.",
      },
    },
  },
  argTypes: {
    layout: {
      control: "select",
      options: ["single", "dual"],
      description: "세로 배치(horizontal={false})에서만 버튼 그룹 간격 규칙을 바꿉니다.",
    },
    horizontal: {
      control: "boolean",
      description:
        "true면 가로 배치이며 layout 값과 관계없이 동일한 Figma 가로 그룹 규칙을 사용합니다.",
    },
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="solid" colorScheme="primary">
        확인
      </Button>
      <Button variant="outlined" colorScheme="secondary">
        취소
      </Button>
    </ButtonGroup>
  ),
};

export const ThreeButtons: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="solid" colorScheme="primary">
        저장
      </Button>
      <Button variant="outlined" colorScheme="secondary">
        취소
      </Button>
      <Button variant="ghost" colorScheme="secondary">
        삭제
      </Button>
    </ButtonGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: "3개 버튼 예시입니다.",
      },
    },
  },
};

export const DualVertical: Story = {
  render: () => (
    <ButtonGroup layout="dual" horizontal={false} className="w-80 [&>*]:w-full">
      <Button variant="solid" colorScheme="tertiary">
        건너뛰기
      </Button>
      <Button variant="solid" colorScheme="primary">
        로그인하고 참여하기
      </Button>
    </ButtonGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: "SessionDialog에서 사용하는 세로형 dual 버튼 그룹입니다.",
      },
    },
  },
};

export const SingleVertical: Story = {
  render: () => (
    <ButtonGroup layout="single" horizontal={false} className="w-80 [&>*]:w-full">
      <Button variant="solid" colorScheme="primary">
        참여하기
      </Button>
    </ButtonGroup>
  ),
};

export const MixedVariants: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="solid" colorScheme="primary">
        Primary
      </Button>
      <Button variant="solid" colorScheme="secondary">
        Secondary
      </Button>
      <Button variant="outlined" colorScheme="primary">
        Outlined
      </Button>
      <Button variant="ghost" colorScheme="secondary">
        Ghost
      </Button>
    </ButtonGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: "버튼 속성은 각 Button 인스턴스에서 개별 제어합니다.",
      },
    },
  },
};

export const SolidColorSchemes: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="solid" colorScheme="primary">
        Primary
      </Button>
      <Button variant="solid" colorScheme="secondary">
        Secondary
      </Button>
      <Button variant="solid" colorScheme="tertiary">
        Tertiary
      </Button>
    </ButtonGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: "Solid variant의 모든 colorScheme (primary, secondary, tertiary) 예시입니다.",
      },
    },
  },
};

const sizes = ["small", "medium", "large"] as const;

export const DifferentSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      {sizes.map((size) => (
        <div key={size}>
          <p className="text-text-secondary mb-2 text-sm capitalize">{size}</p>
          <ButtonGroup>
            <Button size={size}>{size} 1</Button>
            <Button size={size}>{size} 2</Button>
          </ButtonGroup>
        </div>
      ))}
    </div>
  ),
};
