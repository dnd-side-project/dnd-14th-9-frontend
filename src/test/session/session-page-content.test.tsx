import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SessionPageContent } from "@/features/session/components/SessionPageContent";

const mockUseAuthState = jest.fn();
const mockUseSessionDetail = jest.fn();
const mockUseInProgressData = jest.fn();
const mockUseWaitingRoom = jest.fn();
const mockUseMe = jest.fn();

jest.mock("next/navigation", () => ({
  notFound: jest.fn(),
}));

jest.mock("@/features/auth/hooks/useAuthState", () => ({
  useAuthState: () => mockUseAuthState(),
}));

jest.mock("@/features/member/hooks/useMemberHooks", () => ({
  useMe: () => mockUseMe(),
}));

jest.mock("@/features/session/hooks/useSessionHooks", () => ({
  useSessionDetail: (...args: unknown[]) => mockUseSessionDetail(...args),
  useInProgressData: (...args: unknown[]) => mockUseInProgressData(...args),
  useWaitingRoom: (...args: unknown[]) => mockUseWaitingRoom(...args),
  useSubmitSessionResult: () => ({ mutateAsync: jest.fn() }),
}));

jest.mock("@/features/session/hooks/useSessionStatusSSE", () => ({
  useSessionStatusSSE: jest.fn(),
}));

jest.mock("@/features/session/hooks/useSessionTimer", () => ({
  clearTimerState: jest.fn(),
  getTimerState: jest.fn(),
}));

jest.mock("@/hooks/usePreventBackNavigation", () => ({
  usePreventBackNavigation: () => ({
    showLeaveDialog: false,
    setShowLeaveDialog: jest.fn(),
    isLeavingRef: { current: false },
  }),
}));

jest.mock("@/features/lobby/components/SessionJoinModal", () => ({
  SessionJoinModal: () => <div data-testid="session-join-modal" />,
}));

jest.mock("@/features/session/components/SessionPageContentSkeleton", () => ({
  SessionPageContentSkeleton: () => <div data-testid="session-page-skeleton" />,
}));

jest.mock("@/features/session/components/SessionHeader", () => ({
  SessionHeader: () => <div data-testid="session-header" />,
}));

jest.mock("@/features/session/components/SessionDetailSection", () => ({
  SessionDetailSection: ({ className }: { className?: string }) => (
    <div data-testid="session-detail-section" className={className} />
  ),
}));

jest.mock("@/features/session/components/SessionTimerSection", () => ({
  SessionTimerSection: ({ className }: { className?: string }) => (
    <div data-testid="session-timer-section" className={className} />
  ),
}));

jest.mock("@/features/session/components/SessionGoalAndTodoCard/SessionGoalAndTodoCard", () => ({
  SessionGoalAndTodoCard: ({ className }: { className?: string }) => (
    <div data-testid="session-goal-card" className={className} />
  ),
}));

jest.mock(
  "@/features/session/components/SessionParticipantListCard/SessionParticipantListCard",
  () => ({
    SessionParticipantListCard: ({ className }: { className?: string }) => (
      <div data-testid="session-participant-card" className={className} />
    ),
  })
);

describe("SessionPageContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuthState.mockReturnValue({
      status: "authenticated",
      profile: {
        id: 7,
      },
    });

    mockUseSessionDetail.mockReturnValue({
      data: {
        result: {
          imageUrl: null,
          category: "DEVELOPMENT",
          title: "세션 제목",
          summary: "세션 소개",
          currentParticipants: 2,
          maxParticipants: 6,
          sessionDurationMinutes: 60,
          startTime: "2026-04-13T12:00:00.000Z",
          notice: "",
        },
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    mockUseInProgressData.mockReturnValue({
      data: {
        participantCount: 1,
        averageAchievementRate: 0,
        members: [],
      },
    });

    mockUseWaitingRoom.mockReturnValue({
      data: {
        result: {
          members: [{ memberId: 7 }],
        },
      },
      isLoading: false,
    });
  });

  it("me 정보가 아직 로딩 중이면 참여 여부를 판단하지 않고 스켈레톤을 유지해야 한다", () => {
    mockUseMe.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<SessionPageContent sessionId="1" />);

    expect(screen.getByTestId("session-page-skeleton")).toBeInTheDocument();
    expect(screen.queryByTestId("session-join-modal")).not.toBeInTheDocument();
  });

  it("recovering 상태에서는 스켈레톤을 노출해야 한다", () => {
    mockUseAuthState.mockReturnValue({
      status: "recovering",
    });
    mockUseMe.mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    render(<SessionPageContent sessionId="1" />);

    expect(screen.getByTestId("session-page-skeleton")).toBeInTheDocument();
    expect(screen.queryByTestId("session-join-modal")).not.toBeInTheDocument();
    expect(screen.queryByTestId("session-header")).not.toBeInTheDocument();
    expect(screen.queryByTestId("session-detail-section")).not.toBeInTheDocument();
    expect(screen.queryByTestId("session-timer-section")).not.toBeInTheDocument();
  });

  it("인증 조회 실패 시 스켈레톤이나 로그인 안내 대신 재시도 화면을 표시한다", async () => {
    const retry = jest.fn();
    mockUseAuthState.mockReturnValue({ status: "unavailable", retry });
    mockUseMe.mockReturnValue({ data: undefined, isLoading: false });

    render(<SessionPageContent sessionId="1" />);

    expect(screen.queryByTestId("session-page-skeleton")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "로그인하고 참여하기" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "다시 시도하기" }));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("authenticated + 참여자이면 메인 콘텐츠를 렌더링해야 한다", () => {
    mockUseMe.mockReturnValue({
      data: {
        result: {
          id: 7,
        },
      },
      isLoading: false,
    });

    render(<SessionPageContent sessionId="1" />);

    expect(mockUseWaitingRoom).toHaveBeenCalledWith("1", { enabled: true });
    expect(screen.getByTestId("session-header")).toBeInTheDocument();
    expect(screen.getByTestId("session-detail-section")).toBeInTheDocument();
    expect(screen.queryByTestId("session-join-modal")).not.toBeInTheDocument();
  });

  it("헤더·상세·타이머는 한 묶음으로 Figma gap/3xl인 40px(gap-3xl) 간격을 갖는다", () => {
    // Given: 참여자로 인증된 상태
    mockUseMe.mockReturnValue({ data: { result: { id: 7 } }, isLoading: false });

    // When: 메인 콘텐츠를 렌더링하면
    render(<SessionPageContent sessionId="1" />);

    // Then: 세 영역은 gap-3xl 세로 flex 묶음의 자식이고, 각자 위 여백(mt-*)은 두지 않는다
    const header = screen.getByTestId("session-header");
    const detail = screen.getByTestId("session-detail-section");
    const timer = screen.getByTestId("session-timer-section");
    const group = header.parentElement;
    expect(group).toHaveClass("flex", "flex-col", "gap-3xl");
    expect(detail.parentElement).toBe(group);
    expect(timer.parentElement).toBe(group);
    expect(detail.className).not.toMatch(/\bmt-/);
    expect(timer.className).not.toMatch(/\bmt-/);
  });

  it("헤더 묶음과 카드 행 사이 간격은 루트 gap이 정한다 (기본 24px, xl에서 Figma 80px)", () => {
    // Given: 참여자로 인증된 상태
    mockUseMe.mockReturnValue({ data: { result: { id: 7 } }, isLoading: false });

    // When: 메인 콘텐츠를 렌더링하면
    render(<SessionPageContent sessionId="1" />);

    // Then: 두 영역은 루트의 자식이고 간격은 루트 gap이 정하므로, 카드 행은 자기 위 여백(mt-*)을 갖지 않는다
    const group = screen.getByTestId("session-header").parentElement;
    const cardRow = screen.getByTestId("session-goal-card").parentElement;
    const root = group?.parentElement;
    expect(cardRow?.parentElement).toBe(root);
    expect(group).not.toContainElement(cardRow);
    expect(root).toHaveClass("flex", "flex-col", "gap-xl", "xl:gap-20");
    expect(cardRow?.className).not.toMatch(/\bmt-|xl:mt-/);
  });

  it("본문 바깥 여백은 xl에서 Figma Main Content와 같다 (좌우 54px, 위 64px, 아래 128px)", () => {
    // Given: 참여자로 인증된 상태
    mockUseMe.mockReturnValue({ data: { result: { id: 7 } }, isLoading: false });

    // When: 메인 콘텐츠를 렌더링하면
    render(<SessionPageContent sessionId="1" />);

    // Then: 기본 p-3xl(40px)을 두고, xl에서 좌우 54px·위 64px·아래 128px(본문 아래 패딩 64 + 푸터 gap 64)이다
    const root = screen.getByTestId("session-header").parentElement?.parentElement;
    expect(root).toHaveClass("p-3xl", "xl:px-[54px]", "xl:pt-4xl", "xl:pb-32");
  });

  it("카드 행이 xl에서 높이 560px(h-140)와 두 카드의 폭 비율(6:4)을 정한다", () => {
    // Given: 참여자로 인증된 상태
    mockUseMe.mockReturnValue({ data: { result: { id: 7 } }, isLoading: false });

    // When: 메인 콘텐츠를 렌더링하면
    render(<SessionPageContent sessionId="1" />);

    // Then: 카드는 크기를 갖지 않으므로 행이 높이를 정하고, 폭 비율은 className으로 카드에 넘긴다
    const cardRow = screen.getByTestId("session-goal-card").parentElement;
    expect(cardRow).toHaveClass("xl:h-140", "xl:flex-row");
    expect(screen.getByTestId("session-goal-card")).toHaveClass("xl:flex-6");
    expect(screen.getByTestId("session-participant-card")).toHaveClass("xl:flex-4");
  });

  it("guest 상태이면 로그인 유도 UI를 노출해야 한다", () => {
    mockUseAuthState.mockReturnValue({
      status: "guest",
    });
    mockUseMe.mockReturnValue({
      data: undefined,
      isLoading: false,
    });
    mockUseWaitingRoom.mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    render(<SessionPageContent sessionId="1" />);

    expect(mockUseWaitingRoom).toHaveBeenCalledWith("1", { enabled: false });
    expect(screen.getByRole("link", { name: "로그인하고 참여하기" })).toHaveAttribute(
      "href",
      "/login"
    );
  });
});
