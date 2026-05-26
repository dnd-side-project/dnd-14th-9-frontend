import { fireEvent, render, screen } from "@testing-library/react";

import { SessionListFilterBar } from "@/features/session/components/SessionList/SessionListFilterBar";
import type { SessionListFilterValues } from "@/features/session/hooks/useSessionListFilters";

const defaultValues: SessionListFilterValues = {
  startDate: null,
  endDate: null,
  timeSlots: [],
  durationRange: null,
  participants: null,
  sort: "POPULAR",
};

function renderFilterBar(values: Partial<SessionListFilterValues> = {}) {
  const props = {
    values: { ...defaultValues, ...values },
    onSetDateRange: jest.fn(),
    onToggleTimeSlot: jest.fn(),
    onSetDurationRange: jest.fn(),
    onSetParticipants: jest.fn(),
    onSetSort: jest.fn(),
    onResetFilters: jest.fn(),
  };

  const view = render(<SessionListFilterBar {...props} />);

  return { ...view, props };
}

function getScrollableFilterRow(container: HTMLElement) {
  const row = container.querySelector(".scrollbar-hide");

  if (!(row instanceof HTMLElement)) {
    throw new Error("SessionListFilterBar scroll row was not rendered");
  }

  return row;
}

describe("SessionListFilterBar", () => {
  it("reserves mobile/tablet panel space when a non-sort filter opens", () => {
    const { container } = renderFilterBar();

    const row = getScrollableFilterRow(container);
    expect(row).not.toHaveClass("pb-[380px]");
    expect(row).not.toHaveClass("-mb-[380px]");

    fireEvent.click(screen.getByRole("button", { name: /시작 시간대/ }));

    expect(screen.getByRole("dialog", { name: "시작 시간대 선택" })).toBeInTheDocument();
    expect(row).toHaveClass("pb-[380px]");
    expect(row).toHaveClass("-mb-[380px]");
    expect(row).toHaveClass("xl:pb-0");
    expect(row).toHaveClass("xl:mb-0");
  });

  it("reserves mobile/tablet panel space for the sort dropdown", () => {
    const { container } = renderFilterBar();

    fireEvent.click(screen.getByRole("button", { name: /인기순/ }));

    expect(screen.getAllByRole("dialog", { name: "정렬 선택" }).length).toBeGreaterThan(0);
    expect(getScrollableFilterRow(container)).toHaveClass("pb-[380px]");
    expect(getScrollableFilterRow(container)).toHaveClass("-mb-[380px]");
    expect(getScrollableFilterRow(container)).toHaveClass("xl:pb-0");
    expect(getScrollableFilterRow(container)).toHaveClass("xl:mb-0");
  });

  it("closes the sort dropdown when the visible sort trigger is clicked again", () => {
    renderFilterBar();
    const sortTrigger = screen.getByRole("button", { name: /인기순/ });

    fireEvent.click(sortTrigger);
    expect(screen.getAllByRole("dialog", { name: "정렬 선택" }).length).toBeGreaterThan(0);

    fireEvent.click(sortTrigger);

    expect(screen.queryByRole("dialog", { name: "정렬 선택" })).not.toBeInTheDocument();
  });

  it("renders a single sort filter trigger so hidden duplicates cannot reopen the dropdown", () => {
    renderFilterBar();

    expect(screen.getAllByRole("button", { name: /인기순/ })).toHaveLength(1);
  });

  it("keeps filter callbacks wired through the existing selection handlers", () => {
    const { props } = renderFilterBar();

    fireEvent.click(screen.getByRole("button", { name: /진행시간/ }));
    fireEvent.click(screen.getByRole("radio", { name: "30분 ~1시간" }));

    expect(props.onSetDurationRange).toHaveBeenCalledWith("HALF_TO_ONE_HOUR");
  });

  it("closes a non-sort panel on Escape and removes the reserved panel space", () => {
    const { container } = renderFilterBar();
    const trigger = screen.getByRole("button", { name: /인원/ });

    fireEvent.click(trigger);
    expect(screen.getByRole("dialog", { name: "참여 인원 선택" })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("dialog", { name: "참여 인원 선택" })).not.toBeInTheDocument();
    expect(getScrollableFilterRow(container)).not.toHaveClass("pb-[380px]");
  });
});
