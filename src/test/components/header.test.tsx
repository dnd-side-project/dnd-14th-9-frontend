import { render, screen } from "@testing-library/react";

import { Header } from "@/components/Header/Header";

jest.mock("@/components/Header/ProfileDropdown", () => ({
  ProfileDropdown: () => <div data-testid="profile-dropdown" />,
}));

describe("Header", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("비로그인 상태에서 로그인 링크를 렌더링한다", () => {
    render(<Header isAuthenticated={false} />);

    expect(screen.getByRole("link", { name: "로그인" })).toHaveAttribute("href", "/login");
    expect(screen.queryByTestId("profile-dropdown")).not.toBeInTheDocument();
  });

  it("로그인 상태에서 세션 만들기와 프로필 패널 트리거를 렌더링한다", () => {
    render(<Header isAuthenticated />);

    expect(screen.getByRole("link", { name: "세션 만들기" })).toHaveAttribute(
      "href",
      "/session/create"
    );
    expect(screen.getByTestId("profile-dropdown")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "로그인" })).not.toBeInTheDocument();
  });
});
