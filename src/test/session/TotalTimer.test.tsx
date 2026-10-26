import { act, render, screen, within } from "@testing-library/react";

import { TotalTimer } from "@/features/session/components/TotalTimer/TotalTimer";

const NOW = new Date("2026-03-01T10:00:00Z");
const MINUTE = 60 * 1000;
const SESSION_MINUTES = 60;

/** 60분 세션이 remainingMinutes분 남은 상태로 렌더링한다 */
function renderTotalTimer(remainingMinutes: number) {
  const result = render(
    <TotalTimer
      sessionEndTime={new Date(NOW.getTime() + remainingMinutes * MINUTE)}
      sessionDurationMinutes={SESSION_MINUTES}
      focusingCount={3}
      totalCount={6}
    />
  );
  const ring = screen.getByRole("progressbar");
  const [, progressCircle] = Array.from(ring.querySelectorAll("circle"));
  return {
    ...result,
    ring,
    progressCircle,
    progress: () => Number(ring.getAttribute("aria-valuenow")),
  };
}

describe("TotalTimer 링", () => {
  beforeEach(() => {
    // Given(공통): 현재 시각을 고정한다
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("남은 시간이 많으면 경과 비율만큼 차 있고 경고색이 아니다", () => {
    // Given: 60분 세션이 40분 남은 상태
    // When: 렌더링하면
    const { progress, progressCircle, ring } = renderTotalTimer(40);

    // Then: 경과 비율(약 33%)만큼 차 있고, 경고색이 아닌 그라디언트 호다
    expect(progress()).toBeCloseTo(33.33, 1);
    expect(progressCircle).not.toHaveClass("stroke-border-error-default");
    expect(ring.querySelector("stop")).not.toBeNull();
  });

  it("시간이 흐르면 링이 차오른다", () => {
    // Given: 60분 세션이 40분 남은 상태로 렌더링되어 있고
    const { progress } = renderTotalTimer(40);
    const before = progress();

    // When: 1분이 흐르면
    act(() => {
      jest.advanceTimersByTime(MINUTE);
    });

    // Then: 링의 진행률이 커진다
    expect(progress()).toBeGreaterThan(before);
  });

  it.each([6, 5])("남은 시간이 %i분(전체의 10% 이하)이면 경고색으로 바뀐다", (remainingMinutes) => {
    // Given: 60분 세션이 남은 시간 10% 이하인 상태
    // When: 렌더링하면
    const { progressCircle, ring } = renderTotalTimer(remainingMinutes);

    // Then: 호와 시간 텍스트가 경고색이다
    expect(progressCircle).toHaveClass("stroke-border-error-default");
    expect(within(ring).getByText(`00:0${remainingMinutes}:00`)).toHaveClass(
      "text-text-status-negative-default"
    );
  });

  it("남은 시간이 7분(전체의 10% 초과)이면 경고색이 아니다", () => {
    // Given: 60분 세션이 남은 시간 10%를 막 넘는 상태
    // When: 렌더링하면
    const { progressCircle, ring } = renderTotalTimer(7);

    // Then: 호와 시간 텍스트가 평소 색이다
    expect(progressCircle).not.toHaveClass("stroke-border-error-default");
    expect(within(ring).getByText("00:07:00")).toHaveClass("text-text-primary");
  });

  it("종료되면 링이 가득 차고 '세션 종료!'를 보여준다", () => {
    // Given: 60분 세션의 남은 시간이 0인 상태
    // When: 렌더링하면
    const { progress, ring } = renderTotalTimer(0);

    // Then: 링이 100%이고 링 안에 '세션 종료!'가 보인다
    expect(progress()).toBe(100);
    expect(within(ring).getByText("세션 종료!")).toBeInTheDocument();
  });
});
