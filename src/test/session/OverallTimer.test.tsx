import { act, render, screen, within } from "@testing-library/react";

import { OverallTimer } from "@/features/session/components/OverallTimer/OverallTimer";

const NOW = new Date("2026-03-01T10:00:00Z");
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const SESSION_MINUTES = 60;

/** 분을 초로 바꾼다 */
const minutes = (value: number) => value * 60;

/** sessionMinutes분 세션이 remainingSeconds초 남은 상태로 렌더링한다 */
function renderOverallTimer(remainingSeconds: number, sessionMinutes = SESSION_MINUTES) {
  const result = render(
    <OverallTimer
      sessionEndTime={new Date(NOW.getTime() + remainingSeconds * SECOND)}
      sessionDurationMinutes={sessionMinutes}
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

describe("OverallTimer 링", () => {
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
    const { progress, progressCircle, ring } = renderOverallTimer(minutes(40));

    // Then: 경과 비율(약 33%)만큼 차 있고, 경고색이 아닌 그라디언트 호다
    expect(progress()).toBeCloseTo(33.33, 1);
    expect(progressCircle).not.toHaveClass("stroke-border-error-default");
    expect(ring.querySelector("stop")).not.toBeNull();
  });

  it("시간이 흐르면 링이 차오른다", () => {
    // Given: 60분 세션이 40분 남은 상태로 렌더링되어 있고
    const { progress } = renderOverallTimer(minutes(40));
    const before = progress();

    // When: 1분이 흐르면
    act(() => {
      jest.advanceTimersByTime(MINUTE);
    });

    // Then: 링의 진행률이 커진다
    expect(progress()).toBeGreaterThan(before);
  });

  it.each([
    [6, "54:00"],
    [5, "55:00"],
  ])(
    "남은 시간이 %i분(전체의 10% 이하)이면 경고색으로 바뀐다 (링 안 %s)",
    (remainingMinutes, ringText) => {
      // Given: 60분 세션이 남은 시간 10% 이하인 상태
      // When: 렌더링하면
      const { progressCircle, ring } = renderOverallTimer(minutes(remainingMinutes));

      // Then: 호와 링 안 시간 텍스트가 경고색이다
      expect(progressCircle).toHaveClass("stroke-border-error-default");
      expect(within(ring).getByText(ringText)).toHaveClass("text-text-status-negative-default");
    }
  );

  it("남은 시간이 7분(전체의 10% 초과)이면 경고색이 아니다", () => {
    // Given: 60분 세션이 남은 시간 10%를 막 넘는 상태
    // When: 렌더링하면
    const { progressCircle, ring } = renderOverallTimer(minutes(7));

    // Then: 호와 링 안 시간 텍스트가 평소 색이다
    expect(progressCircle).not.toHaveClass("stroke-border-error-default");
    expect(within(ring).getByText("53:00")).toHaveClass("text-text-primary");
  });

  it("종료되면 링이 가득 차고 '세션 종료!'를 보여준다", () => {
    // Given: 60분 세션의 남은 시간이 0인 상태
    // When: 렌더링하면
    const { progress, ring } = renderOverallTimer(0);

    // Then: 링이 100%이고 링 안에 '세션 종료!', 카드 왼쪽에 '종료'가 보인다
    expect(progress()).toBe(100);
    expect(within(ring).getByText("세션 종료!")).toBeInTheDocument();
    expect(screen.getByText("종료")).toBeInTheDocument();
  });
});

describe("OverallTimer 시간 표기", () => {
  beforeEach(() => {
    // Given(공통): 현재 시각을 고정한다
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("남은 시간이 아니라 경과 시간을 왼쪽은 시:분:초, 링 안은 분:초로 보여준다", () => {
    // Given: 60분 세션이 9분 50초 남은 상태(50분 10초 경과)
    // When: 렌더링하면
    const { ring } = renderOverallTimer(minutes(9) + 50);

    // Then: 왼쪽은 00:50:10, 링 안은 50:10
    expect(screen.getByText("00:50:10")).toBeInTheDocument();
    expect(within(ring).getByText("50:10")).toBeInTheDocument();
  });

  it("경과 시간이 1시간 이상이면 링 안도 시:분:초로 보여준다", () => {
    // Given: 90분 세션이 20분 남은 상태(70분 경과)
    // When: 렌더링하면
    const { ring } = renderOverallTimer(minutes(20), 90);

    // Then: 링 안이 01:10:00
    expect(within(ring).getByText("01:10:00")).toBeInTheDocument();
  });

  it("시간이 흐르면 경과 시간이 늘어난다", () => {
    // Given: 60분 세션이 9분 50초 남은 상태로 렌더링되어 있고
    renderOverallTimer(minutes(9) + 50);
    expect(screen.getByText("00:50:10")).toBeInTheDocument();

    // When: 1분이 흐르면
    act(() => {
      jest.advanceTimersByTime(MINUTE);
    });

    // Then: 경과 시간이 00:51:10이 된다
    expect(screen.getByText("00:51:10")).toBeInTheDocument();
  });
});
