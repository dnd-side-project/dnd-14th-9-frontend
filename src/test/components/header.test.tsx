import { render, screen } from "@testing-library/react";

import { Header } from "@/components/Header/Header";
import { useAuthState } from "@/features/auth/hooks/useAuthState";

jest.mock("@/features/member/components/ProfileDropdown/ProfileDropdown", () => ({
  ProfileDropdown: () => <div data-testid="profile-dropdown" />,
}));

jest.mock("@/features/auth/hooks/useAuthState", () => ({
  useAuthState: jest.fn(),
}));

describe("Header", () => {
  const mockedUseAuthState = jest.mocked(useAuthState);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("비로그인 상태에서 로그인 링크를 렌더링한다", () => {
    mockedUseAuthState.mockReturnValue({ status: "guest" });
    render(<Header />);

    const loginLinks = screen.getAllByRole("link", { name: "로그인" });

    expect(loginLinks).toHaveLength(2);
    expect(loginLinks[0]).toHaveAttribute("href", "/login");
    expect(loginLinks[1]).toHaveAttribute("href", "/login");
    expect(screen.queryByTestId("profile-dropdown")).not.toBeInTheDocument();
  });

  it("로그인 상태에서 세션 만들기와 프로필 패널 트리거를 렌더링한다", () => {
    mockedUseAuthState.mockReturnValue({
      status: "authenticated",
      profile: {
        id: 1,
        nickname: "경환",
        profileImageUrl: null,
        email: null,
        bio: null,
        socialProvider: "google",
        totalParticipationTime: 0,
        focusedTime: 0,
        focusRate: 0,
        totalTodoCount: 0,
        completedTodoCount: 0,
        todoCompletionRate: 0,
        participationSessionCount: 0,
        firstLogin: false,
      },
    });
    render(<Header />);

    const createSessionLinks = screen.getAllByRole("link", { name: "세션 만들기" });

    expect(createSessionLinks).toHaveLength(2);
    expect(createSessionLinks[0]).toHaveAttribute("href", "/session/create");
    expect(createSessionLinks[1]).toHaveAttribute("href", "/session/create");
    expect(screen.getByTestId("profile-dropdown")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "로그인" })).not.toBeInTheDocument();
  });

  it("recovering 상태에서는 헤더 우측 로딩 UI를 렌더링한다", () => {
    mockedUseAuthState.mockReturnValue({ status: "recovering" });
    render(<Header />);

    expect(screen.getByRole("status", { name: "인증 상태 확인 중" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "로그인" })).not.toBeInTheDocument();
    expect(screen.queryByTestId("profile-dropdown")).not.toBeInTheDocument();
  });
});
