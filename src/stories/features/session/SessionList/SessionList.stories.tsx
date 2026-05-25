import { SessionListSkeleton } from "@/features/session/components/SessionList/SessionListSkeleton";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

/**
 * SessionList 스켈레톤 스토리
 *
 * 목적: 스켈레톤 UI가 실제 SessionList의 반응형 레이아웃과
 * 일치하는지 breakpoint별로 고정된 너비에서 시각적으로 검증합니다.
 *
 * ⚠️ defaultViewport가 아닌 고정 너비 컨테이너를 사용합니다.
 * → Storybook 창 크기에 관계없이 항상 동일한 레이아웃 상태를 보여줍니다.
 *
 * 검증 포인트:
 * - 헤더: 제목 + 설명 텍스트 + 필터바 (mobile은 세로, md+ 가로 배치)
 * - mobile(375px): 1열 그리드
 * - tablet(768px): 2열 그리드 (md:grid-cols-2)
 * - lg(1024px): ⚠️ 2열 유지 (3열이 되어서는 안 됩니다.)
 * - desktop xl(1280px+): 4열 그리드 (xl:grid-cols-4)
 */
const meta = {
  title: "Features/Session/SessionList",
  component: SessionListSkeleton,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "모집 중 세션 목록 스켈레톤입니다. 고정 너비 컨테이너 기준으로 실제 SessionList와 동일한 반응형 구조를 검증합니다.",
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
    docs: {
      description: {
        story:
          "너비 1280px 고정 (xl): xl:grid-cols-4로 4열 렌더링되며 xl:gap-y-[48px]가 적용됩니다.",
      },
    },
  },
};
