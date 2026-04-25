import { render, screen } from "@testing-library/react";

import { ChipBadge } from "@/components/ChipBadge/ChipBadge";

describe("ChipBadge", () => {
  it("defaults to md size styles", () => {
    render(<ChipBadge>기본</ChipBadge>);

    expect(screen.getByText("기본")).toHaveClass("px-3", "text-xs");
  });

  it("applies sm size styles without forwarding size to the DOM", () => {
    render(<ChipBadge size="sm">작게</ChipBadge>);

    const badge = screen.getByText("작게");

    expect(badge).toHaveClass("px-2", "text-[10px]");
    expect(badge).not.toHaveAttribute("size");
  });
});
