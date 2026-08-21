import { fireEvent, render, screen } from "@testing-library/react";

import { SearchFilterSection } from "@/features/session/components/SearchFilterSection/SearchFilterSection";

const mockPush = jest.fn();
let mockSearchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

describe("SearchFilterSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  it("카테고리 버튼들을 정상적으로 렌더링한다", () => {
    render(<SearchFilterSection />);

    expect(screen.getByRole("button", { name: "전체" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "개발" })).toBeInTheDocument();
  });

  it("카테고리 버튼 클릭 시 URL searchParams를 업데이트한다", () => {
    render(<SearchFilterSection />);

    const devButton = screen.getByRole("button", { name: "개발" });
    fireEvent.click(devButton);

    expect(mockPush).toHaveBeenCalledWith("?category=DEVELOPMENT", { scroll: false });
  });

  it("검색어 입력 후 제출 시 URL searchParams를 업데이트한다", () => {
    render(<SearchFilterSection />);

    const searchInput = screen.getByPlaceholderText("관심 분야의 세션을 검색해 보세요");
    fireEvent.change(searchInput, { target: { value: "알고리즘" } });
    fireEvent.submit(searchInput.closest("form")!);

    expect(mockPush).toHaveBeenCalledWith("?q=%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98", {
      scroll: false,
    });
  });

  it("카테고리 펼치기/접기 토글 시 aria-expanded가 변경되고 마스크가 제거된다", () => {
    render(<SearchFilterSection />);

    const toggleButton = screen.getByRole("button", { name: "카테고리 펼치기" });
    expect(toggleButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggleButton);

    expect(screen.getByRole("button", { name: "카테고리 접기" })).toHaveAttribute(
      "aria-expanded",
      "true"
    );

    const allButton = screen.getByRole("button", { name: "전체" });
    const scrollContainer = allButton.parentElement as HTMLDivElement;
    expect(scrollContainer.style.maskImage).toBe("");
  });

  it("가로 스크롤 이벤트 발생 시 컴포넌트 리렌더링 없이 DOM style.maskImage를 직접 갱신한다", () => {
    render(<SearchFilterSection />);

    const allButton = screen.getByRole("button", { name: "전체" });
    const scrollContainer = allButton.parentElement as HTMLDivElement;
    expect(scrollContainer).toBeInTheDocument();

    // 1) 중간 위치로 스크롤 (좌우 모두 그라데이션)
    Object.defineProperty(scrollContainer, "scrollWidth", { value: 1000, configurable: true });
    Object.defineProperty(scrollContainer, "clientWidth", { value: 300, configurable: true });
    Object.defineProperty(scrollContainer, "scrollLeft", { value: 50, configurable: true });
    fireEvent.scroll(scrollContainer);
    expect(scrollContainer.style.maskImage).toBe(
      "linear-gradient(to right, transparent, black 40px, black calc(100% - 40px), transparent)"
    );

    // 2) 오른쪽 끝으로 스크롤 (왼쪽만 그라데이션)
    Object.defineProperty(scrollContainer, "scrollLeft", { value: 700, configurable: true });
    fireEvent.scroll(scrollContainer);
    expect(scrollContainer.style.maskImage).toBe(
      "linear-gradient(to right, transparent, black 40px)"
    );

    // 3) 왼쪽 시작점으로 스크롤 (오른쪽만 그라데이션)
    Object.defineProperty(scrollContainer, "scrollLeft", { value: 0, configurable: true });
    fireEvent.scroll(scrollContainer);
    expect(scrollContainer.style.maskImage).toBe(
      "linear-gradient(to right, black calc(100% - 40px), transparent)"
    );
  });
});
