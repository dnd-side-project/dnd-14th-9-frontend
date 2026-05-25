import { SessionListSkeleton } from "@/features/session/components/SessionList/SessionListSkeleton";

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
  lg: {
    name: "Lg (1024px)",
    styles: { width: "1024px", height: "800px" },
  },
  desktop: {
    name: "Desktop (1280px)",
    styles: { width: "1280px", height: "800px" },
  },
};

/**
 * SessionList 스켈레톤 스토리
 *
 * 목적: 스켈레톤 UI가 실제 SessionList의 반응형 레이아웃과
 * 일치하는지 breakpoint별로 고정된 너비에서 시각적으로 검증합니다.
 *
 * ⚠️ CSS 미디어 쿼리는 뷰포트(iframe) 크기를 따르기 때문에,
 * customViewports를 등록하고 각 스토리별로 defaultViewport를 결합하여
 * 실제 뷰포트 크기와 FixedWidthFrame 너비를 일치시킵니다.
 */
const meta = {
  title: "Features/Session/SessionList",
  component: SessionListSkeleton,
  parameters: {
    layout: "centered",
    viewport: {
      viewports: customViewports,
    },
    docs: {
      description: {
        component:
          "모집 중 세션 목록 스켈레톤입니다. 커스텀 뷰포트 설정과 고정 너비 컨테이너의 결합을 통해 실제 SessionList와 동일한 반응형 구조를 검증합니다.",
      },
    },
  },
} satisfies Meta<typeof SessionListSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

function FixedWidthFrame({ width, children }: { width: number; children: React.ReactNode }) {
  return (
    <div
      className="dark bg-[#0b0f0e] p-5 md:px-10 xl:px-[54px]"
      style={{ width, overflow: "hidden" }}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SessionListSkeleton — breakpoint별 고정 너비
// ---------------------------------------------------------------------------

/**
 * mobile: 너비 375px 고정
 * → md(768px) 미만이므로 1열 그리드 및 헤더 세로 스택이 보여야 합니다.
 */
export const SkeletonMobile: Story = {
  render: () => (
    <FixedWidthFrame width={375}>
      <SessionListSkeleton />
    </FixedWidthFrame>
  ),
  parameters: {
    viewport: { defaultViewport: "mobile" },
    docs: {
      description: {
        story:
          "너비 375px 고정 (md 미만): 헤더 세로 스택 + 1열 그리드. 필터바가 헤더 아래 세로로 배치됩니다.",
      },
    },
  },
};

/**
 * tablet: 너비 768px 고정
 * → md(768px) 이상이므로 2열 그리드 및 헤더 가로 배치가 보여야 합니다.
 */
export const SkeletonTablet: Story = {
  render: () => (
    <FixedWidthFrame width={768}>
      <SessionListSkeleton />
    </FixedWidthFrame>
  ),
  parameters: {
    viewport: { defaultViewport: "tablet" },
    docs: {
      description: {
        story: "너비 768px 고정 (md): 헤더 가로 배치(제목+설명 / 필터바) + 2열 그리드.",
      },
    },
  },
};

/**
 * lg: 너비 1024px 고정
 * → md 이상, xl 미만이므로 2열 그리드가 유지되어야 합니다.
 * ⚠️ 3열이 되면 실제 SessionList와 불일치입니다.
 */
export const SkeletonLg: Story = {
  render: () => (
    <FixedWidthFrame width={1024}>
      <SessionListSkeleton />
    </FixedWidthFrame>
  ),
  parameters: {
    viewport: { defaultViewport: "lg" },
    docs: {
      description: {
        story:
          "너비 1024px 고정 (lg): ⚠️ 2열 유지 확인 포인트. 3열이 되면 실제 SessionList와 불일치입니다.",
      },
    },
  },
};

/**
 * desktop: 너비 1280px 고정
 * → xl(1280px) 이상이므로 4열 그리드가 보여야 합니다.
 */
export const SkeletonDesktop: Story = {
  render: () => (
    <FixedWidthFrame width={1280}>
      <SessionListSkeleton />
    </FixedWidthFrame>
  ),
  parameters: {
    viewport: { defaultViewport: "desktop" },
    docs: {
      description: {
        story:
          "너비 1280px 고정 (xl): xl:grid-cols-4로 4열 렌더링되며 xl:gap-y-[48px]가 적용됩니다.",
      },
    },
  },
};
