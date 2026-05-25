import { Card } from "@/features/session/components/Card/Card";
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
    name: "Desktop (1440px)",
    styles: { width: "1440px", height: "800px" },
  },
};

/**
 * RecommendedSection 스켈레톤 & 실제 컴포넌트 비교 스토리
 *
 * 목적:
 * 실제 카드 컴포넌트(Card)에 가짜 데이터를 직접 주입한 추천 세션 목록의 실제 반응형 레이아웃과,
 * 이에 대응하는 로딩 스켈레톤(RecommendedGridSkeleton)의 반응형 레이아웃 정합성을 1:1 비교 검증합니다.
 *
 * 💡 실제 API 호출이나 React Query 의존성을 완전히 제거하기 위해,
 * 스토리북 상에서 가짜 데이터를 직접 주입(Presenter UI)하여 렌더링합니다.
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
          "추천 세션 영역의 실제 컴포넌트와 스켈레톤 컴포넌트 비교 스토리입니다. 반응형 레이아웃의 구조적 정합성을 확인합니다.",
      },
    },
  },
} satisfies Meta<typeof RecommendedGridSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

function FixedWidthFrame({
  width,
  title,
  children,
}: {
  width: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-text-muted px-2 text-xs font-bold">{title}</div>
      <div
        className="dark border-border-subtle rounded-md border bg-[#0b0f0e] p-5"
        style={{ width, overflow: "hidden" }}
      >
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mock Data (가짜 데이터 직접 주입 방식)
// ---------------------------------------------------------------------------
const mockRecommendedSessions = Array.from({ length: 4 }, (_, i) => ({
  sessionId: i + 1,
  category: "DEVELOPMENT",
  title: `추천 세션 타이틀 ${i + 1}`,
  hostNickname: `호스트 닉네임 ${i + 1}`,
  status: "WAITING",
  currentParticipants: i + 1,
  maxParticipants: 10,
  sessionDurationMinutes: 60,
  startTime: "2026-02-21T10:00:00",
  imageUrl: "",
}));

// ---------------------------------------------------------------------------
// 1. Mobile (375px) — 가로 스크롤 구조 비교
// ---------------------------------------------------------------------------
export const CompareMobile: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <FixedWidthFrame
        width={375}
        title="[실제 컴포넌트 가짜 데이터 주입] RecommendedGrid - Mobile (가로 스크롤)"
      >
        <div className="relative">
          <div className="scrollbar-hide flex gap-6 overflow-x-auto pb-1">
            {mockRecommendedSessions.map((session) => (
              <div key={session.sessionId} className="w-[226px] shrink-0">
                <Card
                  thumbnailSrc={session.imageUrl}
                  category={session.category}
                  createdAt={session.startTime}
                  title={session.title}
                  nickname={session.hostNickname}
                  currentParticipants={session.currentParticipants}
                  maxParticipants={session.maxParticipants}
                  durationMinutes={session.sessionDurationMinutes}
                  sessionDate={session.startTime}
                />
              </div>
            ))}
          </div>
          <div className="from-surface-default pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l to-transparent" />
        </div>
      </FixedWidthFrame>

      <FixedWidthFrame
        width={375}
        title="[스켈레톤] RecommendedGridSkeleton - Mobile (가로 스크롤)"
      >
        <RecommendedGridSkeleton forceBreakpoint="mobile" />
      </FixedWidthFrame>
    </div>
  ),
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
};

// ---------------------------------------------------------------------------
// 2. Tablet (768px) — 2열 그리드 구조 비교
// ---------------------------------------------------------------------------
export const CompareTablet: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <FixedWidthFrame
        width={768}
        title="[실제 컴포넌트 가짜 데이터 주입] RecommendedGrid - Tablet (2열 그리드)"
      >
        <div className="grid grid-cols-2 gap-6">
          {mockRecommendedSessions.map((session) => (
            <div key={session.sessionId} className="mx-auto w-full xl:max-w-69">
              <Card
                thumbnailSrc={session.imageUrl}
                category={session.category}
                createdAt={session.startTime}
                title={session.title}
                nickname={session.hostNickname}
                currentParticipants={session.currentParticipants}
                maxParticipants={session.maxParticipants}
                durationMinutes={session.sessionDurationMinutes}
                sessionDate={session.startTime}
              />
            </div>
          ))}
        </div>
      </FixedWidthFrame>

      <FixedWidthFrame width={768} title="[스켈레톤] RecommendedGridSkeleton - Tablet (2열 그리드)">
        <RecommendedGridSkeleton forceBreakpoint="tablet" />
      </FixedWidthFrame>
    </div>
  ),
  parameters: {
    viewport: { defaultViewport: "tablet" },
  },
};

// ---------------------------------------------------------------------------
// 3. Desktop (1440px) — xl: 4열 그리드 구조 비교
// ---------------------------------------------------------------------------
export const CompareDesktop: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <FixedWidthFrame
        width={1440}
        title="[실제 컴포넌트 가짜 데이터 주입] RecommendedGrid - Desktop (4열 그리드)"
      >
        <div className="grid grid-cols-4 gap-6 gap-y-[48px]">
          {mockRecommendedSessions.map((session) => (
            <div key={session.sessionId} className="mx-auto w-full xl:max-w-69">
              <Card
                thumbnailSrc={session.imageUrl}
                category={session.category}
                createdAt={session.startTime}
                title={session.title}
                nickname={session.hostNickname}
                currentParticipants={session.currentParticipants}
                maxParticipants={session.maxParticipants}
                durationMinutes={session.sessionDurationMinutes}
                sessionDate={session.startTime}
              />
            </div>
          ))}
        </div>
      </FixedWidthFrame>

      <FixedWidthFrame
        width={1440}
        title="[스켈레톤] RecommendedGridSkeleton - Desktop (4열 그리드)"
      >
        <RecommendedGridSkeleton forceBreakpoint="desktop" />
      </FixedWidthFrame>
    </div>
  ),
  parameters: {
    viewport: { defaultViewport: "desktop" },
  },
};
