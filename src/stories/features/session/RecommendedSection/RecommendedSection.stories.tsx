import { RecommendedGridSkeleton } from "@/features/session/components/RecommendedSection/RecommendedGridSkeleton";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

/**
 * RecommendedSection 스켈레톤 스토리
 *
 * 목적: 스켈레톤 UI가 실제 RecommendedGrid의 반응형 레이아웃과
 * 일치하는지 breakpoint별로 고정된 너비에서 시각적으로 검증합니다.
 *
 * ⚠️ defaultViewport가 아닌 고정 너비 컨테이너를 사용합니다.
 * → Storybook 창 크기에 관계없이 항상 동일한 레이아웃 상태를 보여줍니다.
 *
 * 검증 포인트:
 * - mobile(767px 이하): 가로 스크롤 구조 + 우측 fade overlay
 * - tablet(768px): 2열 그리드
 * - desktop(1280px): 4열 그리드
 */
const meta = {
  title: "Features/Session/RecommendedSection",
  component: RecommendedGridSkeleton,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "추천 세션 그리드 스켈레톤입니다. 고정 너비 컨테이너 기준으로 실제 RecommendedGrid와 동일한 반응형 구조를 검증합니다.",
      },
    },
  },
} satisfies Meta<typeof RecommendedGridSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

function FixedWidthFrame({ width, children }: { width: number; children: React.ReactNode }) {
  return (
    <div className="dark bg-[#0b0f0e] p-5" style={{ width, overflow: "hidden" }}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// RecommendedGridSkeleton — breakpoint별 고정 너비
// ---------------------------------------------------------------------------

/**
 * mobile: 너비 375px 고정
 * → md(768px) 미만이므로 가로 스크롤 구조가 보여야 합니다.
 * → `w-[226px] shrink-0` 카드 + 우측 fade overlay 확인
 */
export const GridSkeletonMobile: Story = {
  render: () => (
    <FixedWidthFrame width={375}>
      <RecommendedGridSkeleton />
    </FixedWidthFrame>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "너비 375px 고정 (md 미만): 카드가 `w-[226px] shrink-0`으로 가로 스크롤되어야 합니다. 우측 fade overlay도 확인하세요.",
      },
    },
  },
};

/**
 * tablet: 너비 768px 고정
 * → md(768px) 이상이므로 2열 그리드가 보여야 합니다.
 */
export const GridSkeletonTablet: Story = {
  render: () => (
    <FixedWidthFrame width={768}>
      <RecommendedGridSkeleton />
    </FixedWidthFrame>
  ),
  parameters: {
    docs: {
      description: {
        story: "너비 768px 고정 (md): grid-cols-2로 2열 렌더링되어야 합니다.",
      },
    },
  },
};

/**
 * desktop: 너비 1280px 고정
 * → xl(1280px) 이상이므로 4열 그리드가 보여야 합니다.
 */
export const GridSkeletonDesktop: Story = {
  render: () => (
    <FixedWidthFrame width={1280}>
      <RecommendedGridSkeleton />
    </FixedWidthFrame>
  ),
  parameters: {
    docs: {
      description: {
        story: "너비 1280px 고정 (xl): xl:grid-cols-4로 4열 렌더링되어야 합니다.",
      },
    },
  },
};
