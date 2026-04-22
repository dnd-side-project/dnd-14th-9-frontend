import { render, screen } from "@testing-library/react";

import { useAuthState } from "@/features/auth/hooks/useAuthState";
import { RecommendedSection } from "@/features/session/components/RecommendedSection/RecommendedSection";

jest.mock("@/features/auth/hooks/useAuthState", () => ({
  useAuthState: jest.fn(),
}));

jest.mock("@/features/session/components/RecommendedSection/RecommendedSectionContent", () => ({
  RecommendedSectionContent: () => <div data-testid="recommended-section-content" />,
}));

jest.mock("@/features/session/components/RecommendedSection/RecommendedSectionSkeleton", () => ({
  RecommendedSectionSkeleton: () => <div data-testid="recommended-section-skeleton" />,
}));

describe("RecommendedSection", () => {
  const mockedUseAuthState = jest.mocked(useAuthState);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("recovering 상태면 섹션 스켈레톤을 렌더링한다", () => {
    mockedUseAuthState.mockReturnValue({ status: "recovering" });

    render(<RecommendedSection />);

    expect(screen.getByTestId("recommended-section-skeleton")).toBeInTheDocument();
    expect(screen.queryByTestId("recommended-section-content")).not.toBeInTheDocument();
  });

  it("authenticated 상태면 추천 섹션 본문을 렌더링한다", () => {
    mockedUseAuthState.mockReturnValue({
      status: "authenticated",
      profile: { id: 1 } as never,
    });

    render(<RecommendedSection />);

    expect(screen.getByTestId("recommended-section-content")).toBeInTheDocument();
    expect(screen.queryByTestId("recommended-section-skeleton")).not.toBeInTheDocument();
  });

  it("guest 상태면 아무것도 렌더링하지 않는다", () => {
    mockedUseAuthState.mockReturnValue({ status: "guest" });

    const { container } = render(<RecommendedSection />);

    expect(container).toBeEmptyDOMElement();
  });
});
