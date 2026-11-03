import { act, render, screen, within } from "@testing-library/react";

import { OverallTimer } from "@/features/session/components/OverallTimer/OverallTimer";

const NOW = new Date("2026-03-01T10:00:00Z");
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const SESSION_MINUTES = 60;

/** 분을 초로 바꾼다 */
const minutes = (value: number) => value * 60;

/** sessionMinutes분 세션이 remainingSeconds초 남은 상태로 렌더링한다 */
function renderOverallTimer(
  remainingSeconds: number,
  sessionMinutes = SESSION_MINUTES,
  ringSize?: "sm" | "md"
) {
  const result = render(
    <OverallTimer
      sessionEndTime={new Date(NOW.getTime() + remainingSeconds * SECOND)}
      sessionDurationMinutes={sessionMinutes}
      focusingCount={3}
      totalCount={6}
      ringSize={ringSize}
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

describe("OverallTimer 카드 레이아웃", () => {
  beforeEach(() => {
    // Given(공통): 현재 시각을 고정한다
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("시간 영역과 집중 인원 줄 사이 간격은 MyTimer와 같은 8px(gap-xs)이다", () => {
    // Given: 60분 세션이 40분 남은 상태
    // When: 렌더링하면
    renderOverallTimer(minutes(40));

    // Then: 왼쪽 정보 열(제목+시간 블록과 집중 인원 줄의 부모)의 간격이 gap-xs다
    const infoColumn = screen.getByRole("heading", { name: "전체 타이머" }).parentElement
      ?.parentElement;
    expect(infoColumn).toHaveClass("gap-xs");
  });
});

describe("OverallTimer 반응형 (Figma 모바일 · 태블릿 · 데스크톱)", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const getCard = () => {
    const infoColumn = screen.getByRole("heading", { name: "전체 타이머" }).parentElement
      ?.parentElement as HTMLElement;
    return { infoColumn, card: infoColumn.parentElement as HTMLElement };
  };

  it("카드는 MyTimer와 같이 모바일 가로, 태블릿 세로(링이 오른쪽 아래), 데스크톱 가로이다", () => {
    // Given: 60분 세션이 40분 남은 상태
    // When: 렌더링하면
    renderOverallTimer(minutes(40));

    // Then: 기본은 가로이고 md에서 세로+오른쪽 정렬+위아래 끝 정렬, xl에서 다시 가로이다
    const { card } = getCard();
    expect(card).toHaveClass("items-start", "md:flex-col", "md:items-end", "md:justify-between");
    expect(card).toHaveClass("xl:flex-row", "xl:items-stretch");
    expect(card).not.toHaveClass("flex-col");
    expect(card.className).not.toMatch(/(^|\s)sm:/);
  });

  it("안쪽 여백은 20 → 24 → 32px, 링과의 간격은 32 → 32 → 20px이다", () => {
    // Given: 60분 세션이 40분 남은 상태
    // When: 렌더링하면
    renderOverallTimer(minutes(40));

    // Then: MyTimer와 같은 값이다
    const { card } = getCard();
    expect(card).toHaveClass("p-lg", "md:p-xl", "xl:p-2xl", "gap-2xl", "xl:gap-lg");
  });

  it("태블릿에서 정보 열은 카드 폭을 모두 쓰고, 데스크톱에서는 기본 정렬로 돌아간다", () => {
    // Given: 60분 세션이 40분 남은 상태
    // When: 렌더링하면
    renderOverallTimer(minutes(40));

    // Then: 오른쪽 정렬 카드에서 정보 열이 줄어들지 않게 md에서 늘린다
    expect(getCard().infoColumn).toHaveClass("md:self-stretch", "xl:self-auto");
  });

  it("제목은 15 → 18px, 시간은 24 → 32px이다", () => {
    // Given: 60분 세션이 9분 50초 남은 상태
    // When: 렌더링하면
    renderOverallTimer(minutes(9) + 50);

    // Then: 모바일 글자 크기가 기본이고 md부터 커진다
    expect(screen.getByText("전체 타이머")).toHaveClass("text-[15px]", "md:text-lg");
    expect(screen.getByText("00:50:10")).toHaveClass("text-2xl", "md:text-[32px]");
  });

  it("ringSize를 안 넘기면 150px 링, sm이면 104px 링이다", () => {
    // Given/When: 기본과 sm으로 각각 렌더링하면
    const { unmount } = renderOverallTimer(minutes(40));

    // Then: 기본은 150px, sm은 104px 링이다
    expect(screen.getByRole("progressbar")).toHaveStyle({ width: "150px", height: "150px" });
    unmount();
    renderOverallTimer(minutes(40), SESSION_MINUTES, "sm");
    expect(screen.getByRole("progressbar")).toHaveStyle({ width: "104px", height: "104px" });
  });
});
