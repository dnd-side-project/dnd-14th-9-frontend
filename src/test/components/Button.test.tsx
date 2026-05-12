import { render, screen } from "@testing-library/react";

import { Button } from "@/components/Button/Button";

describe("Button", () => {
  it("medium size matches the Figma md dimensions", () => {
    render(<Button size="medium">확인</Button>);

    expect(screen.getByRole("button", { name: "확인" })).toHaveClass(
      "h-11",
      "min-w-[77px]",
      "px-lg",
      "py-sm",
      "text-sm"
    );
  });

  it("solid primary uses the Figma state tokens", () => {
    render(<Button>확인</Button>);

    expect(screen.getByRole("button", { name: "확인" })).toHaveClass(
      "bg-surface-primary-default",
      "text-text-inverse",
      "hover:bg-surface-primary-subtle",
      "active:bg-surface-primary-strong"
    );
  });

  it("icon-only medium button matches the Figma md square dimensions", () => {
    render(
      <Button
        iconOnly
        size="medium"
        aria-label="더하기"
        leftIcon={<span aria-hidden="true">+</span>}
      />
    );

    expect(screen.getByRole("button", { name: "더하기" })).toHaveClass(
      "size-11",
      "min-w-0",
      "p-sm"
    );
  });
});
