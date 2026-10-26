import { render, screen, within } from "@testing-library/react";

import { MyTimer } from "@/features/session/components/MyTimer/MyTimer";

jest.mock("@/features/session/hooks/useSessionHooks", () => ({
  useToggleMyStatus: () => ({ mutate: jest.fn(), isPending: false }),
}));

const NOW = new Date("2026-03-01T10:00:00Z");
const SESSION_ID = "my-timer-test";
const SESSION_MINUTES = 60;

/** useSessionTimer가 복원하는 localStorage 상태를 심고 MyTimer를 렌더링한다 */
function renderMyTimer({
  elapsedSeconds,
  isRunning,
}: {
  elapsedSeconds: number;
  isRunning: boolean;
}) {
  localStorage.setItem(
    `session-timer:${SESSION_ID}`,
    JSON.stringify({
      elapsedSeconds,
      focusedSeconds: elapsedSeconds,
      focusRate: Math.round((elapsedSeconds / (SESSION_MINUTES * 60)) * 100),
      isFocusing: isRunning,
      isRunning,
      lastSavedAt: NOW.getTime(),
    })
  );
  return render(<MyTimer sessionId={SESSION_ID} sessionDurationMinutes={SESSION_MINUTES} />);
}

describe("MyTimer 카드", () => {
  beforeEach(() => {
    // Given(공통): 현재 시각을 고정해 저장된 시간이 더 흐르지 않게 한다
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
    localStorage.clear();
  });

  it("1시간 미만이어도 카드 왼쪽은 시:분:초, 링 안은 분:초로 보여준다", () => {
    // Given: 43분 21초가 경과한 정지 상태
    // When: 렌더링하면
    renderMyTimer({ elapsedSeconds: 43 * 60 + 21, isRunning: false });

    // Then: 왼쪽은 00:43:21, 링 안은 43:21
    expect(screen.getByText("00:43:21")).toBeInTheDocument();
    expect(within(screen.getByRole("progressbar")).getByText("43:21")).toBeInTheDocument();
  });

  it("진행 중이면 '잠깐 정지하기' 버튼과 초록 제목·시간, '집중 중'을 보여준다", () => {
    // Given: 25분이 경과한 진행 중 상태
    // When: 렌더링하면
    renderMyTimer({ elapsedSeconds: 25 * 60, isRunning: true });

    // Then: 윤곽선 버튼, 초록 제목·시간, 집중 중 상태
    expect(screen.getByRole("button", { name: "잠깐 정지하기" })).toHaveClass(
      "border-border-default"
    );
    expect(screen.getByText("나의 집중 시간")).toHaveClass("text-text-brand-subtler");
    expect(screen.getByText("00:25:00")).toHaveClass("text-text-brand-default");
    expect(screen.getByText("집중 중")).toBeInTheDocument();
  });

  it("정지 상태면 '다시 시작하기' 버튼과 회색 제목·시간, '자리비움'을 보여준다", () => {
    // Given: 25분이 경과한 정지 상태
    // When: 렌더링하면
    renderMyTimer({ elapsedSeconds: 25 * 60, isRunning: false });

    // Then: 연한 초록 배경 버튼, 회색 제목·시간, 자리비움 상태
    expect(screen.getByRole("button", { name: "다시 시작하기" })).toHaveClass(
      "bg-surface-primary-alpha-subtler"
    );
    expect(screen.getByText("나의 집중 시간")).toHaveClass("text-text-disabled");
    expect(screen.getByText("00:25:00")).toHaveClass("text-text-disabled");
    expect(screen.getByText("자리비움")).toBeInTheDocument();
  });
});
