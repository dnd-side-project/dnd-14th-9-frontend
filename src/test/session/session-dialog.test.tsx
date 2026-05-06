import { render, screen } from "@testing-library/react";

import { SessionDialog } from "@/features/session/components/SessionDialog/SessionDialog";

const mockUseAuthState = jest.fn();
const mockUseMe = jest.fn();
const mockUseSessionDetail = jest.fn();
const mockUseWaitingRoom = jest.fn();
const mockUseShareSession = jest.fn();

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

jest.mock("@/features/session/hooks/useShareSession", () => ({
  useShareSession: () => mockUseShareSession(),
}));

jest.mock("@/hooks/useDialog", () => ({
  useDialog: () => ({
    dialogRef: { current: null },
    handleClose: jest.fn(),
    handleBackdropClick: jest.fn(),
  }),
}));

jest.mock("@/lib/navigation/hardNavigate", () => ({
  navigateWithHardReload: jest.fn(),
}));

jest.mock("@/features/lobby/components/SessionJoinModal", () => ({
  SessionJoinModal: () => <div data-testid="session-join-modal" />,
}));

jest.mock("@/features/session/components/Card/Card", () => ({
  Card: () => <div data-testid="session-card" />,
}));

jest.mock("@/features/session/components/Card/CardSkeleton", () => ({
  CardSkeleton: () => <div data-testid="session-card-skeleton" />,
}));

jest.mock("@/components/Icon/AlertIcon", () => ({
  AlertIcon: () => <svg aria-hidden="true" />,
}));

jest.mock("@/components/Icon/CloseIcon", () => ({
  CloseIcon: () => <svg aria-hidden="true" />,
}));

jest.mock("@/components/Icon/ShareIcon", () => ({
  ShareIcon: () => <svg aria-hidden="true" />,
}));

describe("SessionDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseShareSession.mockReturnValue({
      shareSession: jest.fn(),
    });

    mockUseSessionDetail.mockReturnValue({
      data: {
        result: {
          imageUrl: null,
          category: "DEVELOPMENT",
          status: "RECRUITING",
          title: "세션 제목",
          summary: "세션 소개",
          currentParticipants: 2,
          maxParticipants: 6,
          sessionDurationMinutes: 60,
          startTime: "2026-04-13T12:00:00.000Z",
        },
      },
      error: null,
    });

    mockUseWaitingRoom.mockReturnValue({
      data: {
        result: {
          members: [],
        },
      },
      isLoading: false,
    });
  });

  it("guest 상태에서는 dual footer 액션을 유지해야 한다", () => {
    mockUseAuthState.mockReturnValue({ status: "guest" });
    mockUseMe.mockReturnValue({ data: undefined });

    render(<SessionDialog sessionId="1" />);

    expect(screen.getByRole("button", { name: "건너뛰기", hidden: true })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "로그인하고 참여하기", hidden: true })).toHaveAttribute(
      "href",
      "/login"
    );
  });

  it("authenticated 상태에서는 single footer 액션을 유지해야 한다", () => {
    mockUseAuthState.mockReturnValue({ status: "authenticated" });
    mockUseMe.mockReturnValue({
      data: {
        result: {
          id: 7,
        },
      },
    });

    render(<SessionDialog sessionId="1" />);

    expect(screen.getByRole("button", { name: "참여하기", hidden: true })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "로그인하고 참여하기", hidden: true })
    ).not.toBeInTheDocument();
  });
});
