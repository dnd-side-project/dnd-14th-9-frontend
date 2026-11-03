import { render, screen } from "@testing-library/react";

import { SessionTimerSection } from "@/features/session/components/SessionTimerSection";
import type { ViewportLayout } from "@/hooks/useViewportLayout";

const mockUseViewportLayout = jest.fn();

jest.mock("@/hooks/useViewportLayout", () => ({
  useViewportLayout: () => mockUseViewportLayout(),
}));

// 두 타이머는 next/dynamic(ssr: false)으로 불러오므로, 받은 링 크기만 보이는 가짜로 바꾼다
jest.mock("@/features/session/components/MyTimer/MyTimer", () => ({
  MyTimer: ({ ringSize }: { ringSize?: string }) => (
    <div data-testid="my-timer" data-ring-size={ringSize} />
  ),
}));

jest.mock("@/features/session/components/OverallTimer/OverallTimer", () => ({
  OverallTimer: ({ ringSize }: { ringSize?: string }) => (
    <div data-testid="overall-timer" data-ring-size={ringSize} />
  ),
}));

function setViewportLayout(layout: ViewportLayout) {
  mockUseViewportLayout.mockReturnValue({ layout, isResolved: true });
}

async function renderSection() {
  render(
    <SessionTimerSection
      sessionId="1"
      sessionDurationMinutes={60}
      startTime="2026-03-01T10:00:00.000Z"
      focusingCount={3}
      totalCount={6}
    />
  );
  return {
    myTimer: await screen.findByTestId("my-timer"),
    overallTimer: await screen.findByTestId("overall-timer"),
  };
}

describe("SessionTimerSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setViewportLayout("desktop");
  });

  it("모바일은 세로(간격 16px), 태블릿부터 가로(간격 20px)로 놓는다", async () => {
    // Given: 두 타이머를 담는 섹션
    // When: 렌더링하면
    const { myTimer } = await renderSection();

    // Then: 기본은 세로 gap-md이고 md부터 가로 gap-lg이다 (기존 sm 기준은 쓰지 않는다)
    const section = myTimer.parentElement?.parentElement as HTMLElement;
    expect(section).toHaveClass("flex", "flex-col", "gap-md", "md:flex-row", "md:gap-lg");
    expect(section).not.toHaveClass("gap-lg");
    expect(section.className).not.toMatch(/xl:flex-row/);
  });

  it("폭은 태블릿에서 Figma 421:247 비율, 데스크톱에서 6:4 비율이다", async () => {
    // Given: 두 타이머를 담는 섹션
    // When: 렌더링하면
    const { myTimer, overallTimer } = await renderSection();

    // Then: 태블릿(md)은 시안의 421/247 폭을 그대로 비율로 쓰고, xl부터 6:4이다
    expect(myTimer.parentElement).toHaveClass("md:flex-[421]", "xl:flex-6");
    expect(overallTimer.parentElement).toHaveClass("md:flex-[247]", "xl:flex-4");
  });

  it.each([
    ["mobile", "sm"],
    ["tablet", "md"],
    ["desktop", "md"],
  ] as const)("%s에서는 두 타이머의 링 크기를 %s로 넘긴다", async (layout, ringSize) => {
    // Given: 화면 크기가 layout인 상태
    setViewportLayout(layout);

    // When: 렌더링하면
    const { myTimer, overallTimer } = await renderSection();

    // Then: 모바일만 Figma size=sm(104px) 링이다
    expect(myTimer).toHaveAttribute("data-ring-size", ringSize);
    expect(overallTimer).toHaveAttribute("data-ring-size", ringSize);
  });
});
