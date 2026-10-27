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
  ringSize,
}: {
  elapsedSeconds: number;
  isRunning: boolean;
  ringSize?: "sm" | "md";
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
  return render(
    <MyTimer sessionId={SESSION_ID} sessionDurationMinutes={SESSION_MINUTES} ringSize={ringSize} />
  );
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

describe("MyTimer 반응형 (Figma 모바일 · 태블릿 · 데스크톱)", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
    localStorage.clear();
  });

  /** 카드 루트: 제목 → 정보 열 → 카드 */
  const getCard = () => {
    const infoColumn = screen.getByRole("heading", { name: "나의 집중 시간" }).parentElement
      ?.parentElement as HTMLElement;
    return { infoColumn, card: infoColumn.parentElement as HTMLElement };
  };

  it("카드는 모바일에서 가로(링이 오른쪽), 태블릿에서 세로(링이 오른쪽 아래), 데스크톱에서 다시 가로이다", () => {
    // Given: 진행 중인 타이머
    // When: 렌더링하면
    renderMyTimer({ elapsedSeconds: 25 * 60, isRunning: true });

    // Then: 기본은 가로(flex-col 없음)이고 md에서 세로+오른쪽 정렬, xl에서 다시 가로이다
    const { card } = getCard();
    expect(card).toHaveClass("items-start", "md:flex-col", "md:items-end", "md:justify-between");
    expect(card).toHaveClass("xl:flex-row", "xl:items-stretch");
    expect(card).not.toHaveClass("flex-col");
    expect(card.className).not.toMatch(/(^|\s)sm:/);
  });

  it("안쪽 여백은 20 → 24 → 32px, 링과의 간격은 32 → 32 → 20px이다", () => {
    // Given: 진행 중인 타이머
    // When: 렌더링하면
    renderMyTimer({ elapsedSeconds: 25 * 60, isRunning: true });

    // Then: 모바일 p-lg, 태블릿 p-xl, 데스크톱 p-2xl / 간격은 gap-2xl이고 xl에서 gap-lg
    const { card } = getCard();
    expect(card).toHaveClass("p-lg", "md:p-xl", "xl:p-2xl", "gap-2xl", "xl:gap-lg");
  });

  it("태블릿에서 정보 열은 카드 폭을 모두 쓰고, 데스크톱에서는 기본 정렬로 돌아간다", () => {
    // Given: 진행 중인 타이머
    // When: 렌더링하면
    renderMyTimer({ elapsedSeconds: 25 * 60, isRunning: true });

    // Then: 카드가 오른쪽 정렬(items-end)이라 정보 열이 줄어들지 않게 md에서 늘린다
    const { infoColumn } = getCard();
    expect(infoColumn).toHaveClass("md:self-stretch", "xl:self-auto");
  });

  it("제목은 15 → 18px, 시간은 24 → 32px이다", () => {
    // Given: 진행 중인 타이머
    // When: 렌더링하면
    renderMyTimer({ elapsedSeconds: 25 * 60, isRunning: true });

    // Then: 모바일 글자 크기가 기본이고 md부터 커진다
    expect(screen.getByText("나의 집중 시간")).toHaveClass("text-[15px]", "md:text-lg");
    expect(screen.getByText("00:25:00")).toHaveClass("text-2xl", "md:text-[32px]");
  });

  it("정지 버튼은 모바일에서 글자 없이 32px 아이콘 버튼이고, 태블릿부터 글자가 보인다", () => {
    // Given: 진행 중인 타이머
    // When: 렌더링하면
    renderMyTimer({ elapsedSeconds: 25 * 60, isRunning: true });

    // Then: 글자는 화면에서만 숨겨(sr-only) 버튼 이름은 그대로이고, 버튼은 모바일에서 32px 정사각형이다
    const button = screen.getByRole("button", { name: "잠깐 정지하기" });
    expect(button).toHaveClass("max-md:size-8", "max-md:min-w-0", "max-md:p-xs");
    expect(screen.getByText("잠깐 정지하기")).toHaveClass("max-md:sr-only");
  });

  it("시작 버튼도 같은 방식으로 모바일에서 아이콘만 보인다", () => {
    // Given: 정지 상태의 타이머
    // When: 렌더링하면
    renderMyTimer({ elapsedSeconds: 25 * 60, isRunning: false });

    // Then: 글자는 sr-only, 버튼은 32px 정사각형이다
    expect(screen.getByRole("button", { name: "다시 시작하기" })).toHaveClass("max-md:size-8");
    expect(screen.getByText("다시 시작하기")).toHaveClass("max-md:sr-only");
  });

  it("모바일에서는 시간·상태 줄이 좁아지면 줄바꿈하고, 상태 글자와 전체 대비 글자가 더 작다", () => {
    // Given: 진행 중인 타이머
    // When: 렌더링하면
    renderMyTimer({ elapsedSeconds: 25 * 60, isRunning: true });

    // Then: 시간 줄과 상태 줄은 flex-wrap(태블릿부터 한 줄), 상태 13px → 15px,
    // 전체 대비는 11px 보통 굵기 → 13px 세미볼드
    const timeRow = screen.getByText("00:25:00").parentElement;
    const statusRow = screen.getByText("집중 중").parentElement;
    expect(timeRow).toHaveClass("flex-wrap", "md:flex-nowrap");
    expect(statusRow).toHaveClass("flex-wrap", "md:flex-nowrap", "gap-xs", "md:gap-md");
    expect(screen.getByText("집중 중")).toHaveClass("text-[13px]", "md:text-[15px]");
    const overall = screen.getByText("전체 시간 대비").parentElement;
    expect(overall).toHaveClass("text-[11px]", "md:text-[13px]", "md:font-semibold");
  });

  it("ringSize를 안 넘기면 150px 링, sm이면 104px 링이다", () => {
    // Given/When: 기본과 sm으로 각각 렌더링하면
    const { unmount } = renderMyTimer({ elapsedSeconds: 25 * 60, isRunning: true });

    // Then: 기본은 150px, sm은 104px 링이다
    expect(screen.getByRole("progressbar")).toHaveStyle({ width: "150px", height: "150px" });
    unmount();
    renderMyTimer({ elapsedSeconds: 25 * 60, isRunning: true, ringSize: "sm" });
    expect(screen.getByRole("progressbar")).toHaveStyle({ width: "104px", height: "104px" });
  });
});
