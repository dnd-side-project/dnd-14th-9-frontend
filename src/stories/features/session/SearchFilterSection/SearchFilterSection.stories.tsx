import { SearchFilterSection } from "@/features/session/components/SearchFilterSection/SearchFilterSection";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const customViewports = {
  mobile: {
    name: "Mobile (375px)",
    styles: { width: "375px", height: "600px" },
  },
  tablet: {
    name: "Tablet (768px)",
    styles: { width: "768px", height: "600px" },
  },
  desktop: {
    name: "Desktop (1440px)",
    styles: { width: "1440px", height: "800px" },
  },
};

const meta = {
  title: "Features/Session/SearchFilterSection",
  component: SearchFilterSection,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    viewport: {
      viewports: customViewports,
    },
    docs: {
      description: {
        component:
          "피그마 Category 디자인 시스템(`Category/Expandable`, `Category/Scrollable`, `Category/Atomic`, `Chip/Filter`)을 바탕으로 구현된 세션 검색 및 카테고리 필터 섹션입니다.",
      },
    },
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/",
        query: {},
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="dark bg-background-default text-foreground min-h-[400px] w-full p-6">
        <div className="mx-auto max-w-[1200px]">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof SearchFilterSection>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// 1. Next.js 라우팅 연동 기본 스토리
// ---------------------------------------------------------------------------

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "기본 상태(전체 카테고리 선택)의 SearchFilterSection입니다.",
      },
    },
  },
};

export const CategorySelected: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/",
        query: { category: "DEVELOPMENT" },
      },
    },
    docs: {
      description: {
        story: "'개발' 카테고리가 쿼리로 선택된 상태입니다.",
      },
    },
  },
};

export const WithSearchKeyword: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/",
        query: { q: "React 스터디", category: "STUDY_READING" },
      },
    },
    docs: {
      description: {
        story: "검색어와 카테고리가 모두 지정된 상태입니다.",
      },
    },
  },
};
