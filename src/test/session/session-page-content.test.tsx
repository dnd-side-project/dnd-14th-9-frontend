import { render, screen } from "@testing-library/react";

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
  SessionDetailSection: () => <div data-testid="session-detail-section" />,
}));

jest.mock("@/features/session/components/SessionTimerSection", () => ({
  SessionTimerSection: () => <div data-testid="session-timer-section" />,
}));

jest.mock("@/features/session/components/SessionGoalAndTodoCard/SessionGoalAndTodoCard", () => ({
  SessionGoalAndTodoCard: () => <div data-testid="session-goal-card" />,
}));

jest.mock("@/features/session/components/SessionParticipantListCard", () => ({
  SessionParticipantListCard: () => <div data-testid="session-participant-card" />,
}));

describe("SessionPageContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuthState.mockReturnValue({
      status: "authenticated",
      hasAuthCookies: true,
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
});
