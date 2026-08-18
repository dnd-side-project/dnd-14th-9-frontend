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
      "text-xs",
      "font-semibold",
      "py-sm",
      "px-md",
      "rounded-sm"
    );
    expect(button).toHaveClass("hover:bg-surface-subtle", "hover:text-text-primary");
  });

  it("renders with selected styles and aria-pressed=true when isSelected is true", () => {
    render(<CategoryFilterButton isSelected={true}>디자인</CategoryFilterButton>);

    const button = screen.getByRole("button", { name: "디자인" });

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveClass("bg-[#52EE8533]", "text-green-600");
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
