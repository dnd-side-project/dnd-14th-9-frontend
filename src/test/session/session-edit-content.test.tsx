import { render, screen } from "@testing-library/react";

import { SessionEditContent } from "@/features/session/components/SessionEditContent";

const mockUseAuthState = jest.fn();
const mockUseSessionDetail = jest.fn();
const mockUseWaitingRoom = jest.fn();
const mockUseMe = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/features/auth/hooks/useAuthState", () => ({
  useAuthState: () => mockUseAuthState(),
}));

jest.mock("@/features/member/hooks/useMemberHooks", () => ({
  useMe: () => mockUseMe(),
}));

jest.mock("@/features/session/hooks/useSessionHooks", () => ({
  useSessionDetail: (...args: unknown[]) => mockUseSessionDetail(...args),
  useWaitingRoom: (...args: unknown[]) => mockUseWaitingRoom(...args),
  useDeleteSession: () => ({ mutate: jest.fn(), isPending: false }),
}));

jest.mock("@/features/session/components/SessionCreateForm", () => ({
  SessionCreateForm: () => <div data-testid="session-edit-form" />,
}));

jest.mock("@/features/session/components/SessionDeleteConfirmDialog", () => ({
  SessionDeleteConfirmDialog: () => <div data-testid="session-delete-dialog" />,
}));

describe("SessionEditContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuthState.mockReturnValue({
      status: "authenticated",
      profile: { id: 7 },
    });

    mockUseSessionDetail.mockReturnValue({
      data: {
        result: {
          sessionId: 1,
          title: "테스트 세션",
          status: "대기",
        },
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    mockUseMe.mockReturnValue({
      data: { result: { id: 7 } },
      isLoading: false,
    });

    mockUseWaitingRoom.mockReturnValue({
      data: {
        result: {
          members: [
            { memberId: 7, role: "HOST", task: null },
            { memberId: 8, role: "PARTICIPANT", task: null },
          ],
        },
      },
      isLoading: false,
    });
  });

  it("호스트면 수정 폼과 삭제 버튼을 렌더링해야 한다", () => {
    render(<SessionEditContent sessionId="1" />);

    expect(screen.getByTestId("session-edit-form")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /삭제하기/ })).toBeInTheDocument();
  });

  it("로그인한 비호스트(참여자)면 수정 폼 대신 권한 안내를 표시해야 한다", () => {
    mockUseMe.mockReturnValue({
      data: { result: { id: 8 } },
      isLoading: false,
    });

    render(<SessionEditContent sessionId="1" />);

    expect(screen.queryByTestId("session-edit-form")).not.toBeInTheDocument();
    expect(screen.getByText("수정 권한이 없어요")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /삭제하기/ })).not.toBeInTheDocument();
  });

  it("로그인한 미참여자면 수정 폼 대신 권한 안내를 표시해야 한다", () => {
    mockUseMe.mockReturnValue({
      data: { result: { id: 99 } },
      isLoading: false,
    });

    render(<SessionEditContent sessionId="1" />);

    expect(screen.queryByTestId("session-edit-form")).not.toBeInTheDocument();
    expect(screen.getByText("수정 권한이 없어요")).toBeInTheDocument();
  });

  it("대기방 조회에 실패하면 수정 폼을 열지 않아야 한다 (fail-closed)", () => {
    mockUseWaitingRoom.mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    render(<SessionEditContent sessionId="1" />);

    expect(screen.queryByTestId("session-edit-form")).not.toBeInTheDocument();
    expect(screen.getByText("수정 권한이 없어요")).toBeInTheDocument();
  });

  it("비로그인 사용자면 로그인 안내를 표시해야 한다", () => {
    mockUseAuthState.mockReturnValue({ status: "guest" });
    mockUseMe.mockReturnValue({ data: undefined, isLoading: false });
    mockUseWaitingRoom.mockReturnValue({ data: undefined, isLoading: false });

    render(<SessionEditContent sessionId="1" />);

    expect(screen.queryByTestId("session-edit-form")).not.toBeInTheDocument();
    expect(screen.getByText("로그인이 필요해요")).toBeInTheDocument();
  });

  it("인증 정보 복구 중이면 수정 폼을 렌더링하지 않아야 한다", () => {
    mockUseAuthState.mockReturnValue({ status: "recovering" });
    mockUseMe.mockReturnValue({ data: undefined, isLoading: true });
    mockUseWaitingRoom.mockReturnValue({ data: undefined, isLoading: true });

    render(<SessionEditContent sessionId="1" />);

    expect(screen.queryByTestId("session-edit-form")).not.toBeInTheDocument();
    expect(screen.getByText("불러오는 중...")).toBeInTheDocument();
  });

  it("대기 중이 아닌 세션이면 호스트여도 수정 불가 안내를 표시해야 한다", () => {
    mockUseSessionDetail.mockReturnValue({
      data: {
        result: {
          sessionId: 1,
          title: "테스트 세션",
          status: "진행중",
        },
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<SessionEditContent sessionId="1" />);

    expect(screen.queryByTestId("session-edit-form")).not.toBeInTheDocument();
    expect(screen.getByText("수정할 수 없는 세션이에요")).toBeInTheDocument();
  });
});
