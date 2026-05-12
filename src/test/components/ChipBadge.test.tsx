import { render, screen } from "@testing-library/react";

import { ChipBadge } from "@/components/ChipBadge/ChipBadge";

describe("ChipBadge", () => {
  it("applies compound styles for radius xs with default md size", () => {
    render(<ChipBadge radius="xs">라운드</ChipBadge>);

    const badge = screen.getByText("라운드");

    expect(badge).toHaveClass("rounded-xs", "px-2", "text-xs");
    expect(badge).not.toHaveAttribute("radius");
  });

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

  it("renders positive status styles", () => {
    render(<ChipBadge status="positive">긍정 상태</ChipBadge>);

    const badge = screen.getByText("긍정 상태");

    expect(badge).toHaveClass("text-text-status-positive-default");
    expect(badge).toHaveClass("bg-[rgba(0,184,219,0.16)]");
  });

  it.each([
    ["recruiting", "모집중"],
    ["closing", "마감 임박"],
    ["inProgress", "진행중"],
    ["closed", "마감"],
    ["positive", "긍정 상태"],
  ] as const)("renders status=%s", (status, label) => {
    render(<ChipBadge status={status}>{label}</ChipBadge>);

    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
