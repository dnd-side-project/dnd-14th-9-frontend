import { RecommendedGridSkeleton } from "@/features/session/components/RecommendedSection/RecommendedGridSkeleton";

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
    name: "Desktop (1280px)",
    styles: { width: "1280px", height: "800px" },
  },
};

/**
 * RecommendedSection 스켈레톤 스토리
 *
 * 목적: 스켈레톤 UI가 실제 RecommendedGrid의 반응형 레이아웃과
 * 일치하는지 breakpoint별로 고정된 너비에서 시각적으로 검증합니다.
 *
 * ⚠️ CSS 미디어 쿼리는 뷰포트(iframe) 크기를 따르기 때문에,
 * customViewports를 등록하고 각 스토리별로 defaultViewport를 결합하여
 * 실제 뷰포트 크기와 FixedWidthFrame 너비를 일치시킵니다.
 */
const meta = {
  title: "Features/Session/RecommendedSection",
  component: RecommendedGridSkeleton,
  parameters: {
    layout: "centered",
    viewport: {
      viewports: customViewports,
    },
    docs: {
      description: {
        component:
          "추천 세션 그리드 스켈레톤입니다. 커스텀 뷰포트 설정과 고정 너비 컨테이너의 결합을 통해 실제 RecommendedGrid와 동일한 반응형 구조를 안전하게 검증합니다.",
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
    viewport: { defaultViewport: "mobile" },
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
    viewport: { defaultViewport: "tablet" },
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
    viewport: { defaultViewport: "desktop" },
    docs: {
      description: {
        story: "너비 1280px 고정 (xl): xl:grid-cols-4로 4열 렌더링되어야 합니다.",
      },
    },
  },
};
