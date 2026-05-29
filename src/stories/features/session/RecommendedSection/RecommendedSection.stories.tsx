import { Card } from "@/features/session/components/Card/Card";
import { RecommendedGridSkeleton } from "@/features/session/components/RecommendedSection/RecommendedGridSkeleton";
import type { SessionListItem } from "@/features/session/types";

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
 * 💡 각 breakpoint를 한 화면에서 안정적으로 비교하기 위해,
 * 스토리북 파일 내 CSS style override 기법으로 미디어 쿼리(md:, xl:)를 우회 강제합니다.
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

// ---------------------------------------------------------------------------
// CSS Breakpoint Style Override (프로덕션 컴포넌트 오염 방지용 트릭)
// ---------------------------------------------------------------------------
function BreakpointOverrideStyle({ mode }: { mode: "mobile" | "tablet" | "desktop" }) {
  if (mode === "mobile") {
    return (
      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* 모바일 강제: 가로 스크롤 영역 보임, 그리드 영역 숨김 */
        .breakpoint-mobile .md\\:hidden {
          display: block !important;
        }
        .breakpoint-mobile .md\\:grid {
          display: none !important;
        }
      `,
        }}
      />
    );
  }

  if (mode === "tablet") {
    return (
      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* 태블릿 강제: 가로 스크롤 숨김, 2열 그리드 강제 */
        .breakpoint-tablet .md\\:hidden {
          display: none !important;
        }
        .breakpoint-tablet .md\\:grid {
          display: grid !important;
        }
        .breakpoint-tablet .xl\\:grid-cols-4 {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }
      `,
        }}
      />
    );
  }

  // desktop
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
      /* 데스크탑 강제: 가로 스크롤 숨김, 4열 그리드 강제 */
      .breakpoint-desktop .md\\:hidden {
        display: none !important;
      }
      .breakpoint-desktop .md\\:grid {
        display: grid !important;
      }
      .breakpoint-desktop .xl\\:grid-cols-4 {
        grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
      }
    `,
      }}
    />
  );
}

function FixedWidthFrame({
  width,
  title,
  mode,
  children,
}: {
  width: number;
  title: string;
  mode: "mobile" | "tablet" | "desktop";
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-2 breakpoint-${mode}`}>
      <BreakpointOverrideStyle mode={mode} />
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
const MOCK_RECOMMENDED_SESSIONS: SessionListItem[] = Array.from({ length: 4 }, (_, i) => ({
  sessionId: i + 1,
  category: "DEVELOPMENT" as const,
  title: `추천 세션 타이틀 ${i + 1}`,
  hostNickname: `호스트 닉네임 ${i + 1}`,
  status: "WAITING" as const,
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
        mode="mobile"
        title="[실제 컴포넌트 가짜 데이터 주입] RecommendedGrid - Mobile (가로 스크롤)"
      >
        <div className="relative">
          <div className="scrollbar-hide flex gap-6 overflow-x-auto pb-1">
            {MOCK_RECOMMENDED_SESSIONS.map((session) => (
              <div key={session.sessionId} className="w-[226px] shrink-0">
                <Card
                  size="sm"
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
        mode="mobile"
        title="[스켈레톤] RecommendedGridSkeleton - Mobile (가로 스크롤)"
      >
        <RecommendedGridSkeleton />
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
        mode="tablet"
        title="[실제 컴포넌트 가짜 데이터 주입] RecommendedGrid - Tablet (2열 그리드)"
      >
        <div className="grid grid-cols-2 gap-6">
          {MOCK_RECOMMENDED_SESSIONS.map((session) => (
            <div key={session.sessionId} className="mx-auto w-full xl:max-w-69">
              <Card
                size="responsive"
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
        width={768}
        mode="tablet"
        title="[스켈레톤] RecommendedGridSkeleton - Tablet (2열 그리드)"
      >
        <RecommendedGridSkeleton />
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
        mode="desktop"
        title="[실제 컴포넌트 가짜 데이터 주입] RecommendedGrid - Desktop (4열 그리드)"
      >
        <div className="grid grid-cols-4 gap-6 gap-y-[48px]">
          {MOCK_RECOMMENDED_SESSIONS.map((session) => (
            <div key={session.sessionId} className="mx-auto w-full xl:max-w-69">
              <Card
                size="responsive"
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
        mode="desktop"
        title="[스켈레톤] RecommendedGridSkeleton - Desktop (4열 그리드)"
      >
        <RecommendedGridSkeleton />
      </FixedWidthFrame>
    </div>
  ),
  parameters: {
    viewport: { defaultViewport: "desktop" },
  },
};
