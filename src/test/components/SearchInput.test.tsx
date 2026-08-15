import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SearchInput } from "@/components/SearchInput/SearchInput";

describe("SearchInput", () => {
  it("renders with default responsive size styles and placeholder", () => {
    render(<SearchInput placeholder="세션 검색" />);

    const input = screen.getByPlaceholderText("세션 검색");
    const container = input.parentElement;

    expect(input).toBeInTheDocument();
    expect(input).toHaveClass("text-[13px]", "md:text-base", "bg-transparent", "text-gray-50");
    expect(container).toHaveClass("h-11", "md:h-14", "bg-surface-strong");
  });

  it("renders with size='md' styles", () => {
    render(<SearchInput size="md" placeholder="세션 검색 (데스크톱)" />);

    const input = screen.getByPlaceholderText("세션 검색 (데스크톱)");
    const container = input.parentElement;

    expect(input).toBeInTheDocument();
    expect(input).toHaveClass("text-base");
    expect(container).toHaveClass("h-14", "max-w-[580px]");
  });

  it("renders with size='sm' styles", () => {
    render(<SearchInput size="sm" placeholder="세션 검색 (모바일)" />);

    const input = screen.getByPlaceholderText("세션 검색 (모바일)");
    const container = input.parentElement;

    expect(input).toBeInTheDocument();
    expect(input).toHaveClass("text-[13px]");
    expect(container).toHaveClass("h-11", "max-w-[375px]");
  });

  it("triggers onSearchClick when clicking the search button", async () => {
    const handleSearchClick = jest.fn();
    const user = userEvent.setup();

    render(<SearchInput placeholder="세션 검색" onSearchClick={handleSearchClick} />);

    const button = screen.getByRole("button", { name: "검색" });
    await user.click(button);

    expect(handleSearchClick).toHaveBeenCalledTimes(1);
  });

  it("allows user to type search query", async () => {
    const user = userEvent.setup();

    render(<SearchInput placeholder="세션 검색" />);

    const input = screen.getByPlaceholderText("세션 검색");
    await user.type(input, "바이브코딩");

    expect(input).toHaveValue("바이브코딩");
  });

  it("renders disabled state properly", () => {
    render(<SearchInput placeholder="세션 검색" disabled />);

    const input = screen.getByPlaceholderText("세션 검색");
    expect(input).toBeDisabled();
  });

  it("merges custom className with container", () => {
    render(<SearchInput placeholder="세션 검색" className="custom-search-class" />);

    const input = screen.getByPlaceholderText("세션 검색");
    const container = input.parentElement;

    expect(container).toHaveClass("custom-search-class", "bg-surface-strong");
  });
});
