import { SessionListSkeleton } from "@/features/session/components/SessionList/SessionListSkeleton";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

/**
 * SessionList 스켈레톤 스토리
 *
 * 목적: SessionListSkeleton이 실제 SessionList의
 * 반응형 레이아웃과 일치하는지 뷰포트별로 시각적으로 검증합니다.
 *
 * 검증 포인트:
 * - 헤더: 제목 + 설명 텍스트 + 필터바 (mobile은 세로, md+ 가로 배치)
 * - mobile(375px): 1열 그리드
 * - tablet(768px): 2열 그리드 (md:grid-cols-2)
 * - desktop xl(1280px+): 4열 그리드 (xl:grid-cols-4)
 * - lg breakpoint(1024px)에서 3열이 되어서는 안 됩니다.
 */
const meta = {
  title: "Features/Session/SessionList",
  component: SessionListSkeleton,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "모집 중 세션 목록 스켈레톤입니다. 뷰포트별로 실제 SessionList와 동일한 반응형 구조를 가져야 합니다.",
      },
    },
  },
} satisfies Meta<typeof SessionListSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

function StoryWrapper({ children }: { children: React.ReactNode }) {
  return <div className="dark min-h-screen bg-[#0b0f0e] p-5 md:px-10 xl:px-[54px]">{children}</div>;
}

// ---------------------------------------------------------------------------
// SessionListSkeleton — 뷰포트별
// ---------------------------------------------------------------------------

/**
 * mobile(375px): 헤더가 세로 스택, 카드는 1열
 *
 * 실제 SessionList 확인 포인트:
 * - 헤더: flex-col (제목 → 설명 → 필터바 순 세로 배치)
 * - 카드 그리드: grid-cols-1
 */
export const SkeletonMobile: Story = {
  render: () => (
    <StoryWrapper>
      <SessionListSkeleton />
    </StoryWrapper>
  ),
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    docs: {
      description: {
        story: "mobile(375px): 헤더 세로 스택 + 1열 그리드. 필터바가 헤더 아래 세로로 배치됩니다.",
      },
    },
  },
};

/**
 * tablet(768px): 헤더가 가로 배치, 카드는 2열
 *
 * 실제 SessionList 확인 포인트:
 * - 헤더: md:flex-row (좌측 제목+설명, 우측 필터바)
 * - 카드 그리드: md:grid-cols-2
 */
export const SkeletonTablet: Story = {
  render: () => (
    <StoryWrapper>
      <SessionListSkeleton />
    </StoryWrapper>
  ),
  parameters: {
    viewport: { defaultViewport: "tablet" },
    docs: {
      description: {
        story:
          "tablet(768px): 헤더 가로 배치(제목+설명 / 필터바) + 2열 그리드. lg(1024px)에서도 2열이어야 합니다.",
      },
    },
  },
};

/**
 * lg(1024px): 2열 유지 확인 — 3열이 되어서는 안 됩니다.
 *
 * 이 뷰포트에서 3열이 된다면 실제 SessionList와 불일치입니다.
 */
export const SkeletonLg: Story = {
  render: () => (
    <StoryWrapper>
      <SessionListSkeleton />
    </StoryWrapper>
  ),
  parameters: {
    viewport: { defaultViewport: "desktop" },
    docs: {
      description: {
        story:
          "lg(1024px): ⚠️ 2열 유지 확인 포인트. 3열이 되면 실제 SessionList(lg:grid-cols-3 없음)와 불일치입니다.",
      },
    },
  },
};

/**
 * desktop xl(1280px+): 헤더 가로 배치, 카드는 4열
 *
 * 실제 SessionList 확인 포인트:
 * - 카드 그리드: xl:grid-cols-4, xl:gap-y-[48px]
 */
export const SkeletonDesktop: Story = {
  render: () => (
    <StoryWrapper>
      <SessionListSkeleton />
    </StoryWrapper>
  ),
  parameters: {
    viewport: { defaultViewport: "desktop" },
    docs: {
      description: {
        story: "desktop xl(1280px+): 4열 그리드 + xl:gap-y-[48px] 확인.",
      },
    },
  },
};
