import { Thumbnail } from "@/components/Thumbnail/Thumbnail";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Components/Thumbnail",
  component: Thumbnail,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "세션 카드 등에서 사용되는 썸네일 이미지 컴포넌트입니다.",
      },
    },
    backgrounds: {
      default: "dark",
    },
  },
  argTypes: {
    src: {
      control: "text",
      description: "이미지 URL",
    },
    alt: {
      control: "text",
      description: "이미지 대체 텍스트",
    },
    radius: {
      control: "select",
      options: ["none", "sm", "md", "lg", "xl"],
      description: "모서리 둥글기",
    },
    fallbackSrc: {
      control: "text",
      description: "로드 실패 시 대체 이미지 URL",
    },
  },
  decorators: [
    (Story) => (
      <div className="dark" style={{ padding: "20px", background: "#0b0f0e", width: "276px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Thumbnail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: "https://picsum.photos/276/146",
    alt: "샘플 썸네일",
    radius: "lg",
  },
};

export const WithFallback: Story = {
  args: {
    src: "https://invalid-url.com/image.jpg",
    alt: "Fallback 테스트",
    radius: "lg",
  },
  parameters: {
    docs: {
      description: {
        story: "잘못된 이미지 URL일 때 placeholder가 표시됩니다.",
      },
    },
  },
};

export const NoImage: Story = {
  args: {
    src: null,
    alt: "이미지 없음",
    radius: "lg",
  },
  parameters: {
    docs: {
      description: {
        story: "src가 null일 때 placeholder가 표시됩니다.",
      },
    },
  },
};

export const AllRadii: Story = {
  args: {
    src: "https://picsum.photos/276/146",
    alt: "썸네일",
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-text-secondary mb-2 text-xs">none</p>
        <Thumbnail src="https://picsum.photos/276/146?1" alt="none" radius="none" />
      </div>
      <div>
        <p className="text-text-secondary mb-2 text-xs">sm</p>
        <Thumbnail src="https://picsum.photos/276/146?2" alt="sm" radius="sm" />
      </div>
      <div>
        <p className="text-text-secondary mb-2 text-xs">md</p>
        <Thumbnail src="https://picsum.photos/276/146?3" alt="md" radius="md" />
      </div>
      <div>
        <p className="text-text-secondary mb-2 text-xs">lg (default)</p>
        <Thumbnail src="https://picsum.photos/276/146?4" alt="lg" radius="lg" />
      </div>
      <div>
        <p className="text-text-secondary mb-2 text-xs">xl</p>
        <Thumbnail src="https://picsum.photos/276/146?5" alt="xl" radius="xl" />
      </div>
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

export const Responsive: Story = {
  args: {
    src: "https://picsum.photos/400/212",
    alt: "반응형 썸네일",
  },
  render: () => (
    <div className="flex flex-col gap-6">
      <div style={{ width: "100%" }}>
        <p className="text-text-secondary mb-2 text-xs">100% (부모 너비)</p>
        <Thumbnail src="https://picsum.photos/400/212?1" alt="100%" />
      </div>
      <div style={{ width: "276px" }}>
        <p className="text-text-secondary mb-2 text-xs">276px (기본 크기)</p>
        <Thumbnail src="https://picsum.photos/400/212?2" alt="276px" />
      </div>
      <div style={{ width: "200px" }}>
        <p className="text-text-secondary mb-2 text-xs">200px</p>
        <Thumbnail src="https://picsum.photos/400/212?3" alt="200px" />
      </div>
      <div style={{ width: "150px" }}>
        <p className="text-text-secondary mb-2 text-xs">150px</p>
        <Thumbnail src="https://picsum.photos/400/212?4" alt="150px" />
      </div>
      <div style={{ width: "100px" }}>
        <p className="text-text-secondary mb-2 text-xs">100px</p>
        <Thumbnail src="https://picsum.photos/400/212?5" alt="100px" />
      </div>
    </div>
  ),
  decorators: [
    (Story) => (
      <div className="dark" style={{ padding: "20px", background: "#0b0f0e", width: "400px" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: "부모 컨테이너 너비에 따라 반응형으로 크기가 조절되며, 276:146 비율을 유지합니다.",
      },
    },
  },
};
