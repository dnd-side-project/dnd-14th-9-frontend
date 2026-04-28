import { render, screen } from "@testing-library/react";

import { Badge } from "@/components/Badge/Badge";

describe("Badge", () => {
  it("기본 렌더링", () => {
    render(<Badge>기본</Badge>);
    expect(screen.getByText("기본")).toBeInTheDocument();
  });

  it("positive status 렌더링", () => {
    render(<Badge status="positive">긍정 상태</Badge>);
    const badge = screen.getByText("긍정 상태");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("text-text-status-positive-default");
    expect(badge).toHaveClass("bg-[rgba(0,184,219,0.16)]");
  });

  it.each([
    ["recruiting", "모집중"],
    ["closing", "마감 임박"],
    ["inProgress", "진행중"],
    ["closed", "마감"],
    ["positive", "긍정 상태"],
  ] as const)("status=%s 렌더링", (status, label) => {
    render(<Badge status={status}>{label}</Badge>);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
