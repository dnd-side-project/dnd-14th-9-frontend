import { RecommendedGridSkeleton } from "@/features/session/components/RecommendedSection/RecommendedGridSkeleton";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

/**
 * RecommendedSection 스켈레톤 스토리
 *
 * 목적: 스켈레톤 UI가 실제 RecommendedGrid/RecommendedSection의
 * 반응형 레이아웃과 일치하는지 뷰포트별로 시각적으로 검증합니다.
 *
 * 검증 포인트:
 * - mobile(375px): 가로 스크롤 구조 + 우측 fade overlay
 * - tablet(768px): 2열 그리드
 * - desktop(1280px): 4열 그리드
 */
const meta = {
  title: "Features/Session/RecommendedSection",
  component: RecommendedGridSkeleton,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "추천 세션 그리드 스켈레톤입니다. 뷰포트별로 실제 RecommendedGrid와 동일한 반응형 구조를 가져야 합니다.",
      },
    },
  },
} satisfies Meta<typeof RecommendedGridSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

function StoryWrapper({ children }: { children: React.ReactNode }) {
  return <div className="dark min-h-screen bg-[#0b0f0e] p-5 md:px-10 xl:px-[54px]">{children}</div>;
}

// ---------------------------------------------------------------------------
// RecommendedGridSkeleton — 뷰포트별
// ---------------------------------------------------------------------------

/** mobile(375px): 가로 스크롤 구조로 렌더링되어야 합니다. */
export const GridSkeletonMobile: Story = {
  render: () => (
    <StoryWrapper>
      <RecommendedGridSkeleton />
    </StoryWrapper>
  ),
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    docs: {
      description: {
        story:
          "mobile(375px): 카드가 `w-[226px] shrink-0`으로 가로 스크롤되어야 합니다. 우측 fade overlay도 확인하세요.",
      },
    },
  },
};

/** tablet(768px): 2열 그리드로 렌더링되어야 합니다. */
export const GridSkeletonTablet: Story = {
  render: () => (
    <StoryWrapper>
      <RecommendedGridSkeleton />
    </StoryWrapper>
  ),
  parameters: {
    viewport: { defaultViewport: "tablet" },
    docs: {
      description: {
        story: "tablet(768px): grid-cols-2로 2열 렌더링되어야 합니다.",
      },
    },
  },
};

/** desktop(1280px): 4열 그리드로 렌더링되어야 합니다. */
export const GridSkeletonDesktop: Story = {
  render: () => (
    <StoryWrapper>
      <RecommendedGridSkeleton />
    </StoryWrapper>
  ),
  parameters: {
    viewport: { defaultViewport: "desktop" },
    docs: {
      description: {
        story: "desktop(1280px~): xl:grid-cols-4로 4열 렌더링되어야 합니다.",
      },
    },
  },
};
