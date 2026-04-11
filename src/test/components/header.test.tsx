import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";

import { Header } from "@/components/Header/Header";
import { GUEST_AUTH_STATE, type AuthState } from "@/lib/auth/auth-state";
import { AuthStateProvider } from "@/providers/AuthStateProvider";

jest.mock("@/features/member/components/ProfileDropdown/ProfileDropdown", () => ({
  ProfileDropdown: () => <div data-testid="profile-dropdown" />,
}));

describe("Header", () => {
  function renderHeader(authState: AuthState) {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AuthStateProvider initialState={authState}>
          <Header />
        </AuthStateProvider>
      </QueryClientProvider>
    );
  }

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("비로그인 상태에서 로그인 링크를 렌더링한다", () => {
    renderHeader(GUEST_AUTH_STATE);

    expect(screen.getByRole("link", { name: "로그인" })).toHaveAttribute("href", "/login");
    expect(screen.queryByTestId("profile-dropdown")).not.toBeInTheDocument();
  });

  it("로그인 상태에서 세션 만들기와 프로필 패널 트리거를 렌더링한다", () => {
    renderHeader({
      status: "authenticated",
      hasAuthCookies: true,
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

    expect(screen.getByRole("link", { name: "세션 만들기" })).toHaveAttribute(
      "href",
      "/session/create"
    );
    expect(screen.getByTestId("profile-dropdown")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "로그인" })).not.toBeInTheDocument();
  });

  it("recovering 상태에서는 헤더 우측 로딩 UI를 렌더링한다", () => {
    renderHeader({
      status: "recovering",
      hasAuthCookies: true,
      profile: null,
      reason: "me_fetch_failed",
    });

    expect(screen.getByRole("status", { name: "인증 상태 확인 중" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "로그인" })).not.toBeInTheDocument();
    expect(screen.queryByTestId("profile-dropdown")).not.toBeInTheDocument();
  });
});
