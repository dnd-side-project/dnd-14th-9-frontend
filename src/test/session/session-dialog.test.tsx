import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

import { SessionDialog } from "@/features/session/components/SessionDialog/SessionDialog";
import { ApiError } from "@/lib/api/api-client";

const mockUseAuthState = jest.fn();
const mockUseMe = jest.fn();
const mockUseSessionDetail = jest.fn();
const mockUseWaitingRoom = jest.fn();
const mockUseShareSession = jest.fn();
const mockNavigateWithHardReload = jest.fn();

jest.mock("@/features/auth/hooks/useAuthState", () => ({
  useAuthState: () => mockUseAuthState(),
}));

jest.mock("@/features/member/hooks/useMemberHooks", () => ({
  useMe: (...args: unknown[]) => mockUseMe(...args),
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
  navigateWithHardReload: (...args: unknown[]) => mockNavigateWithHardReload(...args),
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
    HTMLDialogElement.prototype.close = jest.fn();

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
      error: null,
      refetch: jest.fn(),
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
    expect(
      screen.queryByRole("button", { name: "다시 시도하기", hidden: true })
    ).not.toBeInTheDocument();
    expect(mockUseMe).toHaveBeenCalledWith({ enabled: false });
    expect(mockUseWaitingRoom).toHaveBeenCalledWith("1", { enabled: false });
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

  it("me 정보가 아직 없으면 참여 여부 확인 중 상태를 유지해야 한다", () => {
    mockUseAuthState.mockReturnValue({ status: "authenticated" });
    mockUseMe.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<SessionDialog sessionId="1" />);

    expect(
      screen.getByRole("button", { name: "참여 여부 확인 중...", hidden: true })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "참여하기", hidden: true })
    ).not.toBeInTheDocument();
  });

  it("이미 참여 중인 사용자는 세션 페이지로 자동 이동해야 한다", async () => {
    mockUseAuthState.mockReturnValue({ status: "authenticated" });
    mockUseMe.mockReturnValue({
      data: {
        result: {
          id: 7,
        },
      },
      isLoading: false,
      error: null,
    });
    mockUseWaitingRoom.mockReturnValue({
      data: {
        result: {
          members: [{ memberId: 7 }],
        },
      },
      isLoading: false,
      error: null,
    });

    render(<SessionDialog sessionId="1" />);

    await waitFor(() => {
      expect(mockNavigateWithHardReload).toHaveBeenCalledWith("/session/1");
    });
  });

  it("guest + meError 상태에서는 retry 대신 로그인 CTA를 노출해야 한다", () => {
    mockUseAuthState.mockReturnValue({ status: "guest" });
    mockUseMe.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("me failed"),
      refetch: jest.fn(),
    });

    render(<SessionDialog sessionId="1" />);

    expect(screen.getByRole("button", { name: "건너뛰기", hidden: true })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "로그인하고 참여하기", hidden: true })).toHaveAttribute(
      "href",
      "/login"
    );
    expect(
      screen.queryByRole("button", { name: "다시 시도하기", hidden: true })
    ).not.toBeInTheDocument();
    expect(mockUseMe).toHaveBeenCalledWith({ enabled: false });
    expect(mockNavigateWithHardReload).not.toHaveBeenCalled();
    expect(screen.queryByTestId("session-join-modal")).not.toBeInTheDocument();
  });

  it("guest + waitingRoomError 상태에서는 retry 대신 로그인 CTA를 노출해야 한다", () => {
    mockUseAuthState.mockReturnValue({ status: "guest" });
    mockUseMe.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    mockUseWaitingRoom.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("waiting room failed"),
      refetch: jest.fn(),
    });

    render(<SessionDialog sessionId="1" />);

    expect(screen.getByRole("button", { name: "건너뛰기", hidden: true })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "로그인하고 참여하기", hidden: true })).toHaveAttribute(
      "href",
      "/login"
    );
    expect(
      screen.queryByRole("button", { name: "다시 시도하기", hidden: true })
    ).not.toBeInTheDocument();
    expect(mockUseWaitingRoom).toHaveBeenCalledWith("1", { enabled: false });
    expect(mockNavigateWithHardReload).not.toHaveBeenCalled();
    expect(screen.queryByTestId("session-join-modal")).not.toBeInTheDocument();
  });

  it("인증 조회 실패 후 guest로 rerender되면 로그인 CTA가 복구되어야 한다", () => {
    const refetchMe = jest.fn();
    const refetchWaitingRoom = jest.fn();
    mockUseAuthState.mockReturnValue({ status: "authenticated" });
    mockUseMe.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("me failed"),
      refetch: refetchMe,
    });
    mockUseWaitingRoom.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: refetchWaitingRoom,
    });

    const { rerender } = render(<SessionDialog sessionId="1" />);

    expect(screen.getByRole("button", { name: "다시 시도하기", hidden: true })).toBeInTheDocument();

    mockUseAuthState.mockReturnValue({ status: "guest" });
    rerender(<SessionDialog sessionId="1" />);

    expect(screen.getByRole("button", { name: "건너뛰기", hidden: true })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "로그인하고 참여하기", hidden: true })).toHaveAttribute(
      "href",
      "/login"
    );
    expect(
      screen.queryByRole("button", { name: "다시 시도하기", hidden: true })
    ).not.toBeInTheDocument();
    expect(refetchMe).not.toHaveBeenCalled();
    expect(refetchWaitingRoom).not.toHaveBeenCalled();
    expect(mockNavigateWithHardReload).not.toHaveBeenCalled();
    expect(screen.queryByTestId("session-join-modal")).not.toBeInTheDocument();
  });

  it("guest에 이전 me/참여자 성공 캐시가 남아도 자동 이동하지 않아야 한다", () => {
    mockUseAuthState.mockReturnValue({ status: "guest" });
    mockUseMe.mockReturnValue({
      data: {
        result: {
          id: 7,
        },
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    mockUseWaitingRoom.mockReturnValue({
      data: {
        result: {
          members: [{ memberId: 7 }],
        },
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<SessionDialog sessionId="1" />);

    expect(mockNavigateWithHardReload).not.toHaveBeenCalled();
    expect(screen.getByRole("link", { name: "로그인하고 참여하기", hidden: true })).toHaveAttribute(
      "href",
      "/login"
    );
    expect(screen.queryByTestId("session-join-modal")).not.toBeInTheDocument();
  });

  it("recovering에 이전 me/참여자 성공 캐시가 남아도 자동 이동하지 않아야 한다", () => {
    mockUseAuthState.mockReturnValue({ status: "recovering" });
    mockUseMe.mockReturnValue({
      data: {
        result: {
          id: 7,
        },
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    mockUseWaitingRoom.mockReturnValue({
      data: {
        result: {
          members: [{ memberId: 7 }],
        },
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<SessionDialog sessionId="1" />);

    expect(mockNavigateWithHardReload).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "로그인 상태 확인 중...", hidden: true })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "로그인하고 참여하기", hidden: true })
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("session-join-modal")).not.toBeInTheDocument();
  });

  it("authenticated + 참여 확인 오류에서는 retry를 유지하고 클릭 시 refetch만 호출해야 한다", () => {
    const refetchMe = jest.fn();
    const refetchWaitingRoom = jest.fn();
    mockUseAuthState.mockReturnValue({ status: "authenticated" });
    mockUseMe.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("me failed"),
      refetch: refetchMe,
    });
    mockUseWaitingRoom.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("waiting room failed"),
      refetch: refetchWaitingRoom,
    });

    render(<SessionDialog sessionId="1" />);

    const retryButton = screen.getByRole("button", { name: "다시 시도하기", hidden: true });
    expect(retryButton).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "로그인하고 참여하기", hidden: true })
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("session-join-modal")).not.toBeInTheDocument();

    fireEvent.click(retryButton);

    expect(refetchMe).toHaveBeenCalledTimes(1);
    expect(refetchWaitingRoom).toHaveBeenCalledTimes(1);
    expect(mockNavigateWithHardReload).not.toHaveBeenCalled();
    expect(screen.queryByTestId("session-join-modal")).not.toBeInTheDocument();
  });

  it("recovering 상태에서는 로그인 상태 확인 중 CTA를 유지해야 한다", () => {
    mockUseAuthState.mockReturnValue({ status: "recovering" });
    mockUseMe.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<SessionDialog sessionId="1" />);

    expect(
      screen.getByRole("button", { name: "로그인 상태 확인 중...", hidden: true })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "다시 시도하기", hidden: true })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "로그인하고 참여하기", hidden: true })
    ).not.toBeInTheDocument();
    expect(mockUseMe).toHaveBeenCalledWith({ enabled: false });
    expect(mockNavigateWithHardReload).not.toHaveBeenCalled();
  });

  it("공개 세션 조회 실패 시 닫기 CTA를 우선해야 한다", () => {
    mockUseAuthState.mockReturnValue({ status: "guest" });
    mockUseMe.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("me failed"),
      refetch: jest.fn(),
    });
    mockUseSessionDetail.mockReturnValue({
      data: undefined,
      error: new Error("session failed"),
    });

    render(<SessionDialog sessionId="1" />);

    expect(screen.getByText("세션 정보를 불러오지 못했어요")).toBeInTheDocument();
    expect(
      within(screen.getByRole("group", { hidden: true })).getByRole("button", {
        name: "닫기",
        hidden: true,
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "다시 시도하기", hidden: true })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "로그인하고 참여하기", hidden: true })
    ).not.toBeInTheDocument();
  });

  it("공개 세션 404에서는 존재하지 않는 세션 안내와 닫기 CTA를 유지해야 한다", () => {
    mockUseAuthState.mockReturnValue({ status: "guest" });
    mockUseMe.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    mockUseSessionDetail.mockReturnValue({
      data: undefined,
      error: new ApiError("session not found", 404),
    });

    render(<SessionDialog sessionId="1" />);

    expect(
      screen.getByText("존재하지 않는 세션입니다. 삭제되었거나 잘못된 주소일 수 있어요.")
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("group", { hidden: true })).getByRole("button", {
        name: "닫기",
        hidden: true,
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "다시 시도하기", hidden: true })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "로그인하고 참여하기", hidden: true })
    ).not.toBeInTheDocument();
  });
});
