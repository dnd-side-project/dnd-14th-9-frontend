import { render, screen } from "@testing-library/react";

import { WaitingRoomContent } from "@/features/lobby/components/WaitingRoomContent";

const mockUseAuthState = jest.fn();
const mockUseSessionDetail = jest.fn();
const mockUseWaitingRoom = jest.fn();
const mockUseMe = jest.fn();
const mockUseWaitingMembersSSE = jest.fn();

jest.mock("next/dynamic", () => () => () => null);

jest.mock("@/features/auth/hooks/useAuthState", () => ({
  useAuthState: () => mockUseAuthState(),
}));

jest.mock("@/features/member/hooks/useMemberHooks", () => ({
  useMe: () => mockUseMe(),
}));

jest.mock("@/features/session/hooks/useSessionHooks", () => ({
  useSessionDetail: (...args: unknown[]) => mockUseSessionDetail(...args),
  useWaitingRoom: (...args: unknown[]) => mockUseWaitingRoom(...args),
}));

jest.mock("@/features/session/hooks/useSessionStatusSSE", () => ({
  useSessionStatusSSE: jest.fn(),
}));

jest.mock("@/features/lobby/hooks/useWaitingMembersSSE", () => ({
  useWaitingMembersSSE: (...args: unknown[]) => mockUseWaitingMembersSSE(...args),
}));

jest.mock("@/features/lobby/hooks/useLeaveOnUnmount", () => ({
  useLeaveOnUnmount: () => ({
    isSessionTransitionRef: { current: false },
  }),
}));

jest.mock("@/hooks/usePreventBackNavigation", () => ({
  usePreventBackNavigation: () => ({
    showLeaveDialog: false,
    setShowLeaveDialog: jest.fn(),
    isLeavingRef: { current: false },
  }),
}));

jest.mock("@/features/lobby/components/WaitingRoomContentSkeleton", () => ({
  WaitingRoomContentSkeleton: () => <div data-testid="waiting-room-skeleton" />,
}));

jest.mock("@/features/lobby/components/SessionJoinModal", () => ({
  SessionJoinModal: () => <div data-testid="session-join-modal" />,
}));

jest.mock("@/features/lobby/components/LobbyHeader", () => ({
  LobbyHeader: () => <div data-testid="lobby-header" />,
}));

jest.mock("@/features/lobby/components/SessionInfoCard", () => ({
  SessionInfoCard: () => <div data-testid="session-info-card" />,
}));

jest.mock("@/features/lobby/components/GoalAndTodoCard", () => ({
  GoalAndTodoCard: () => <div data-testid="goal-todo-card" />,
}));

jest.mock("@/features/lobby/components/ParticipantListCard", () => ({
  ParticipantListCard: () => <div data-testid="participant-list-card" />,
}));

describe("WaitingRoomContent", () => {
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
          sessionId: "1",
          startTime: "2026-04-13T12:00:00.000Z",
          maxParticipants: 5,
        },
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    mockUseWaitingRoom.mockReturnValue({
      data: {
        result: {
          members: [{ memberId: 7, role: "HOST", task: null }],
        },
      },
      isLoading: false,
    });

    mockUseWaitingMembersSSE.mockReturnValue({ data: null });
  });

  it("recovering 상태면 스켈레톤을 표시해야 한다", () => {
    mockUseAuthState.mockReturnValue({
      status: "recovering",
    });
    mockUseMe.mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    render(<WaitingRoomContent sessionId="1" />);

    expect(screen.getByTestId("waiting-room-skeleton")).toBeInTheDocument();
    expect(screen.queryByTestId("session-join-modal")).not.toBeInTheDocument();
  });

  it("waitingRoom 데이터 로딩 중이면 스켈레톤을 표시해야 한다", () => {
    mockUseMe.mockReturnValue({
      data: {
        result: {
          id: 7,
        },
      },
      isLoading: false,
    });
    mockUseWaitingRoom.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<WaitingRoomContent sessionId="1" />);

    expect(screen.getByTestId("waiting-room-skeleton")).toBeInTheDocument();
    expect(screen.queryByTestId("session-join-modal")).not.toBeInTheDocument();
  });

  it("인증 완료 + 데이터 로딩 완료면 정상 UI를 렌더링해야 한다", () => {
    mockUseMe.mockReturnValue({
      data: {
        result: {
          id: 7,
        },
      },
      isLoading: false,
    });

    render(<WaitingRoomContent sessionId="1" />);

    expect(screen.queryByTestId("waiting-room-skeleton")).not.toBeInTheDocument();
    expect(screen.queryByTestId("session-join-modal")).not.toBeInTheDocument();
    expect(screen.getByTestId("lobby-header")).toBeInTheDocument();
    expect(screen.getByTestId("session-info-card")).toBeInTheDocument();
    expect(screen.getByTestId("goal-todo-card")).toBeInTheDocument();
    expect(screen.getByTestId("participant-list-card")).toBeInTheDocument();
  });

  it("me 정보가 아직 로딩 중이면 참여 여부를 판단하지 않고 스켈레톤을 유지해야 한다", () => {
    mockUseMe.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<WaitingRoomContent sessionId="1" />);

    expect(screen.getByTestId("waiting-room-skeleton")).toBeInTheDocument();
    expect(screen.queryByTestId("session-join-modal")).not.toBeInTheDocument();
  });
});
