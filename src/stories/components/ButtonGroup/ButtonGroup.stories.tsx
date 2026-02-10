import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "@/components/Button/Button";
import { ButtonGroup } from "@/components/ButtonGroup/ButtonGroup";

const meta = {
  title: "Components/ButtonGroup",
  component: ButtonGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "여러 개의 Button을 가로로 정렬·관리하기 위한 컨테이너 컴포넌트입니다. 컨테이너 너비에 따라 자연스럽게 줄바꿈됩니다.",
      },
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

export const DifferentSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-text-secondary mb-2 text-sm">Small</p>
        <ButtonGroup>
          <Button size="small">Small 1</Button>
          <Button size="small">Small 2</Button>
        </ButtonGroup>
      </div>
      <div>
        <p className="text-text-secondary mb-2 text-sm">Medium</p>
        <ButtonGroup>
          <Button size="medium">Medium 1</Button>
          <Button size="medium">Medium 2</Button>
        </ButtonGroup>
      </div>
      <div>
        <p className="text-text-secondary mb-2 text-sm">Large</p>
        <ButtonGroup>
          <Button size="large">Large 1</Button>
          <Button size="large">Large 2</Button>
        </ButtonGroup>
      </div>
    </div>
  ),
};
