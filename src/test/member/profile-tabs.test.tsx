import { render, screen } from "@testing-library/react";

import { ProfileTabs } from "@/features/member/components/Profile/ProfileTabs";

const mockUsePathname = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

describe("ProfileTabs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue("/profile/settings");
  });

  it("3개 탭의 텍스트와 링크를 올바르게 렌더링해야 한다", () => {
    render(<ProfileTabs />);

    const settingsTab = screen.getByRole("link", { name: "내 정보" });
    const reportTab = screen.getByRole("link", { name: "기록 리포트" });
    const accountTab = screen.getByRole("link", { name: "계정 관리" });

    expect(settingsTab).toHaveAttribute("href", "/profile/settings");
    expect(reportTab).toHaveAttribute("href", "/profile/report");
    expect(accountTab).toHaveAttribute("href", "/profile/account");
  });

  it("마이페이지 메뉴를 가리키는 semantic nav 요소를 렌더링해야 한다", () => {
    render(<ProfileTabs />);

    const nav = screen.getByRole("navigation", { name: "마이페이지 메뉴" });
    expect(nav).toBeInTheDocument();
  });

  it("활성 탭에 active 보더, 텍스트 색상 및 aria-current='page'가 적용되어야 한다", () => {
    mockUsePathname.mockReturnValue("/profile/settings");
    render(<ProfileTabs />);

    const settingsTab = screen.getByRole("link", { name: "내 정보" });
    const reportTab = screen.getByRole("link", { name: "기록 리포트" });

    expect(settingsTab).toHaveAttribute("aria-current", "page");
    expect(settingsTab).toHaveClass("border-border-stronger", "text-text-primary");

    expect(reportTab).not.toHaveAttribute("aria-current");
    expect(reportTab).toHaveClass("border-transparent", "text-text-muted");
  });

  it("경로 변경 시 해당하는 탭이 활성화되어야 한다", () => {
    mockUsePathname.mockReturnValue("/profile/report");
    render(<ProfileTabs />);

    const settingsTab = screen.getByRole("link", { name: "내 정보" });
    const reportTab = screen.getByRole("link", { name: "기록 리포트" });

    expect(reportTab).toHaveAttribute("aria-current", "page");
    expect(reportTab).toHaveClass("border-border-stronger", "text-text-primary");

    expect(settingsTab).not.toHaveAttribute("aria-current");
    expect(settingsTab).toHaveClass("border-transparent", "text-text-muted");
  });

  it("모바일 균등 분할(flex-1) 및 반응형 타이포그래피, 패딩 클래스를 포함해야 한다", () => {
    render(<ProfileTabs />);

    const tab = screen.getByRole("link", { name: "내 정보" });
    expect(tab).toHaveClass(
      "flex-1",
      "justify-center",
      "items-center",
      "text-center",
      "px-2",
      "py-3",
      "md:flex-initial",
      "md:items-start",
      "md:px-6",
      "md:text-left"
    );

    const span = tab.querySelector("span");
    expect(span).toHaveClass("text-xs", "font-semibold", "whitespace-nowrap", "md:text-base");
  });
});
