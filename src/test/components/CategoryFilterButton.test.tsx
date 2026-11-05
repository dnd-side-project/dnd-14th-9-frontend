import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CategoryFilterButton } from "@/components/CategoryFilterButton/CategoryFilterButton";

describe("CategoryFilterButton", () => {
  it("renders with default styles and aria-pressed=false when isSelected is false", () => {
    render(<CategoryFilterButton isSelected={false}>개발</CategoryFilterButton>);

    const button = screen.getByRole("button", { name: "개발" });

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button).toHaveClass(
      "bg-surface-strong",
      "text-text-muted",
      "text-sm",
      "md:text-base",
      "font-semibold",
      "h-11",
      "md:h-14",
      "rounded-md"
    );
    // 시안 tertiary: hover는 배경만, 눌림은 배경 subtler + 글자 secondary
    expect(button).toHaveClass(
      "hover:bg-surface-subtle",
      "active:bg-surface-subtler",
      "active:text-text-secondary"
    );
    expect(button).not.toHaveClass("hover:text-text-primary");
    expect(button.querySelector("svg")).toBeNull();
  });

  it("renders with selected styles and aria-pressed=true when isSelected is true", () => {
    render(<CategoryFilterButton isSelected={true}>디자인</CategoryFilterButton>);

    const button = screen.getByRole("button", { name: "디자인" });

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveClass("bg-surface-primary-alpha-subtler", "text-text-brand-default");
    expect(button).not.toHaveClass("bg-surface-strong", "text-text-muted");
    // 시안 secondary: hover 16% · 눌림 24%
    expect(button).toHaveClass(
      "hover:bg-surface-primary-alpha-subtle",
      "active:bg-surface-primary-alpha-default"
    );
    // 선택 상태에서는 체크 아이콘이 함께 렌더된다.
    expect(button.querySelector("svg")).toBeInTheDocument();
  });

  it("handles click events properly", async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<CategoryFilterButton onClick={handleClick}>기획 · PM</CategoryFilterButton>);

    const button = screen.getByRole("button", { name: "기획 · PM" });
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("merges custom className without losing variant classes", () => {
    render(
      <CategoryFilterButton className="custom-class" isSelected={false}>
        전체
      </CategoryFilterButton>
    );

    const button = screen.getByRole("button", { name: "전체" });

    expect(button).toHaveClass("custom-class", "bg-surface-strong");
  });
});
