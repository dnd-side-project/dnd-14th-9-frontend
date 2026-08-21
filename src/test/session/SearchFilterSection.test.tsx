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

  it("가로 스크롤 이벤트 발생 시 컴포넌트 리렌더링 없이 DOM style.maskImage를 직접 갱신한다", () => {
    render(<SearchFilterSection />);

    // 전체 버튼의 부모 요소(scrollRef)를 가져옴
    const allButton = screen.getByRole("button", { name: "전체" });
    const scrollContainer = allButton.parentElement as HTMLDivElement;
    expect(scrollContainer).toBeInTheDocument();

    // scrollWidth, clientWidth, scrollLeft 모킹
    Object.defineProperty(scrollContainer, "scrollWidth", { value: 1000, configurable: true });
    Object.defineProperty(scrollContainer, "clientWidth", { value: 300, configurable: true });
    Object.defineProperty(scrollContainer, "scrollLeft", { value: 50, configurable: true });

    // 스크롤 이벤트 발생
    fireEvent.scroll(scrollContainer);

    // style.maskImage가 DOM에 직접 반영되었는지 검증
    expect(scrollContainer.style.maskImage).toContain("linear-gradient");
  });
});
