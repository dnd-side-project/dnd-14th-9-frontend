import { SessionCardItem } from "@/features/session/components/SessionList/SessionCardItem";
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
    name: "Desktop (1440px)",
    styles: { width: "1440px", height: "800px" },
  },
};

/**
 * SessionList 스켈레톤 & 실제 컴포넌트 비교 스토리
 *
 * 목적:
 * 실제 카드 컴포넌트(SessionCardItem)에 가짜 데이터를 직접 주입한 모집 중 세션 목록의 실제 반응형 레이아웃과,
 * 이에 대응하는 로딩 스켈레톤(SessionListSkeleton)의 반응형 레이아웃 정합성을 1:1 비교 검증합니다.
 *
 * 💡 프로덕션 컴포넌트를 단 한 줄도 수정하지 않기 위해,
 * 스토리북 파일 내에서 CSS style override 기법을 사용하여 미디어 쿼리(md:, xl:)를 우회 강제합니다.
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
          "모집 중 세션 목록 실제 컴포넌트와 스켈레톤 컴포넌트 비교 스토리입니다. 반응형 레이아웃의 구조적 정합성을 확인합니다.",
      },
    },
  },
} satisfies Meta<typeof SessionListSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// CSS Breakpoint Style Override (프로덕션 컴포넌트 오염 방지용 트릭)
// ---------------------------------------------------------------------------
function BreakpointOverrideStyle({ mode }: { mode: "mobile" | "tablet" | "lg" | "desktop" }) {
  if (mode === "mobile") {
    return (
      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* 모바일 강제: 헤더 세로 스택, 1열 그리드 */
        .breakpoint-mobile .md\\:flex-row {
          flex-direction: column !important;
          align-items: flex-start !important;
          justify-content: flex-start !important;
        }
        .breakpoint-mobile .md\\:grid-cols-2 {
          grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
        }
      `,
        }}
      />
    );
  }

  if (mode === "tablet" || mode === "lg") {
    return (
      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* 태블릿 강제: 헤더 가로 배치, 2열 그리드 */
        .breakpoint-tablet .md\\:flex-row,
        .breakpoint-lg .md\\:flex-row {
          flex-direction: row !important;
          align-items: flex-start !important;
          justify-content: space-between !important;
        }
        .breakpoint-tablet .md\\:grid-cols-2,
        .breakpoint-lg .md\\:grid-cols-2 {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }
        .breakpoint-tablet .xl\\:grid-cols-4,
        .breakpoint-lg .xl\\:grid-cols-4 {
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
      /* 데스크탑 강제: 헤더 가로 배치, 4열 그리드 */
      .breakpoint-desktop .md\\:flex-row {
        flex-direction: row !important;
        align-items: flex-start !important;
        justify-content: space-between !important;
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
  mode: "mobile" | "tablet" | "lg" | "desktop";
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-2 breakpoint-${mode}`}>
      <BreakpointOverrideStyle mode={mode} />
      <div className="text-text-muted px-2 text-xs font-bold">{title}</div>
      <div
        className="dark border-border-subtle rounded-md border bg-[#0b0f0e] p-5 md:px-10 xl:px-[54px]"
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
const mockSessions = Array.from({ length: 8 }, (_, i) => ({
  sessionId: i + 1,
  category: "DEVELOPMENT" as const,
  title: `모집 중인 세션 타이틀 ${i + 1}`,
  hostNickname: `호스트 ${i + 1}`,
  status: "WAITING" as const,
  currentParticipants: i + 1,
  maxParticipants: 10,
  sessionDurationMinutes: 60,
  startTime: "2026-02-21T10:00:00",
  imageUrl: "",
}));

const mockOnShare = (id: number) => {
  alert(`Share Session Link: ${id}`);
};

// ---------------------------------------------------------------------------
// 1. Mobile (375px) — 1열 그리드 및 세로 헤더 비교
// ---------------------------------------------------------------------------
export const CompareMobile: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <FixedWidthFrame
        width={375}
        mode="mobile"
        title="[실제 컴포넌트 가짜 데이터 주입] SessionList - Mobile (1열 + 세로 헤더)"
      >
        <section className="gap-lg flex flex-col">
          <div className="flex flex-col gap-[10px]">
            <h2 className="text-text-primary text-lg font-bold">지금 모집 중인 세션</h2>
            <div className="flex flex-col gap-3">
              <p className="text-text-muted text-[13px]">
                현재 모집 중인 세션에 바로 참여해 보세요
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                <button className="bg-surface-subtle text-text-secondary rounded-md px-3 py-1.5 text-xs whitespace-nowrap">
                  정렬
                </button>
                <button className="bg-surface-subtle text-text-secondary rounded-md px-3 py-1.5 text-xs whitespace-nowrap">
                  날짜
                </button>
                <button className="bg-surface-subtle text-text-secondary rounded-md px-3 py-1.5 text-xs whitespace-nowrap">
                  시간
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {mockSessions.map((session) => (
              <SessionCardItem key={session.sessionId} session={session} onShare={mockOnShare} />
            ))}
          </div>
        </section>
      </FixedWidthFrame>

      <FixedWidthFrame
        width={375}
        mode="mobile"
        title="[스켈레톤] SessionListSkeleton - Mobile (1열 + 세로 헤더)"
      >
        <SessionListSkeleton />
      </FixedWidthFrame>
    </div>
  ),
  parameters: {
    viewport: { defaultViewport: "mobile" },
  },
};

// ---------------------------------------------------------------------------
// 2. Tablet (768px) — 2열 그리드 및 가로 헤더 비교
// ---------------------------------------------------------------------------
export const CompareTablet: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <FixedWidthFrame
        width={768}
        mode="tablet"
        title="[실제 컴포넌트 가짜 데이터 주입] SessionList - Tablet (2열 + 가로 헤더)"
      >
        <section className="gap-lg flex flex-col">
          <div className="flex flex-col gap-[10px]">
            <h2 className="text-text-primary text-lg font-bold md:text-2xl">지금 모집 중인 세션</h2>
            <div className="flex flex-row items-start justify-between gap-5">
              <p className="text-text-muted text-base">현재 모집 중인 세션에 바로 참여해 보세요</p>
              <div className="flex gap-2">
                <button className="bg-surface-subtle text-text-secondary rounded-md px-3 py-1.5 text-xs">
                  정렬
                </button>
                <button className="bg-surface-subtle text-text-secondary rounded-md px-3 py-1.5 text-xs">
                  날짜
                </button>
                <button className="bg-surface-subtle text-text-secondary rounded-md px-3 py-1.5 text-xs">
                  시간
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {mockSessions.map((session) => (
              <SessionCardItem key={session.sessionId} session={session} onShare={mockOnShare} />
            ))}
          </div>
        </section>
      </FixedWidthFrame>

      <FixedWidthFrame
        width={768}
        mode="tablet"
        title="[스켈레톤] SessionListSkeleton - Tablet (2열 + 가로 헤더)"
      >
        <SessionListSkeleton />
      </FixedWidthFrame>
    </div>
  ),
  parameters: {
    viewport: { defaultViewport: "tablet" },
  },
};

// ---------------------------------------------------------------------------
// 3. Lg (1024px) — ⚠️ 2열 유지 확인 비교
// ---------------------------------------------------------------------------
export const CompareLg: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <FixedWidthFrame
        width={1024}
        mode="lg"
        title="[실제 컴포넌트 가짜 데이터 주입] SessionList - Lg (⚠️ 2열 유지 확인)"
      >
        <section className="gap-lg flex flex-col">
          <div className="flex flex-col gap-[10px]">
            <h2 className="text-text-primary text-lg font-bold md:text-2xl">지금 모집 중인 세션</h2>
            <div className="flex flex-row items-start justify-between gap-5">
              <p className="text-text-muted text-base">현재 모집 중인 세션에 바로 참여해 보세요</p>
              <div className="flex gap-2">
                <button className="bg-surface-subtle text-text-secondary rounded-md px-3 py-1.5 text-xs">
                  정렬
                </button>
                <button className="bg-surface-subtle text-text-secondary rounded-md px-3 py-1.5 text-xs">
                  날짜
                </button>
                <button className="bg-surface-subtle text-text-secondary rounded-md px-3 py-1.5 text-xs">
                  시간
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {mockSessions.map((session) => (
              <SessionCardItem key={session.sessionId} session={session} onShare={mockOnShare} />
            ))}
          </div>
        </section>
      </FixedWidthFrame>

      <FixedWidthFrame
        width={1024}
        mode="lg"
        title="[스켈레톤] SessionListSkeleton - Lg (⚠️ 2열 유지 확인)"
      >
        <SessionListSkeleton />
      </FixedWidthFrame>
    </div>
  ),
  parameters: {
    viewport: { defaultViewport: "lg" },
  },
};

// ---------------------------------------------------------------------------
// 4. Desktop (1440px) — 4열 그리드 비교
// ---------------------------------------------------------------------------
export const CompareDesktop: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <FixedWidthFrame
        width={1440}
        mode="desktop"
        title="[실제 컴포넌트 가짜 데이터 주입] SessionList - Desktop (4열 그리드)"
      >
        <section className="gap-lg flex flex-col">
          <div className="flex flex-col gap-[10px]">
            <h2 className="text-text-primary text-lg font-bold md:text-2xl">지금 모집 중인 세션</h2>
            <div className="flex flex-row items-start justify-between gap-5">
              <p className="text-text-muted text-base">현재 모집 중인 세션에 바로 참여해 보세요</p>
              <div className="flex gap-2">
                <button className="bg-surface-subtle text-text-secondary rounded-md px-3 py-1.5 text-xs">
                  정렬
                </button>
                <button className="bg-surface-subtle text-text-secondary rounded-md px-3 py-1.5 text-xs">
                  날짜
                </button>
                <button className="bg-surface-subtle text-text-secondary rounded-md px-3 py-1.5 text-xs">
                  시간
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-6 gap-y-[48px]">
            {mockSessions.map((session) => (
              <SessionCardItem key={session.sessionId} session={session} onShare={mockOnShare} />
            ))}
          </div>
        </section>
      </FixedWidthFrame>

      <FixedWidthFrame
        width={1440}
        mode="desktop"
        title="[스켈레톤] SessionListSkeleton - Desktop (4열 그리드)"
      >
        <SessionListSkeleton />
      </FixedWidthFrame>
    </div>
  ),
  parameters: {
    viewport: { defaultViewport: "desktop" },
  },
};
