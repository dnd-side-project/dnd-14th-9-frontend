import { fireEvent, render, screen } from "@testing-library/react";

import { ChatQuickActionBar } from "@/features/session/components/ChatDialog/ChatQuickActionBar";

afterEach(() => {
  jest.restoreAllMocks();
});

it("화살표와 퀵액션을 8px 간격으로 배치하고 스크롤 위치에 맞는 컨트롤을 노출한다", () => {
  jest.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(300);
  jest.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockReturnValue(600);
  const scrollBy = jest.fn();
  Object.defineProperty(HTMLElement.prototype, "scrollBy", {
    configurable: true,
    value: scrollBy,
  });

  render(<ChatQuickActionBar selected={null} onSelect={() => {}} />);

  const list = screen.getByRole("group", { name: "퀵 메시지 목록" });
  expect(list.parentElement).toHaveClass("relative", "h-8", "w-full", "items-start", "gap-2");
  expect(list).toHaveClass("min-w-0", "flex-1", "gap-2");
  expect(screen.getByTestId("left-arrow-slot")).toHaveClass("z-20", "h-8", "w-6", "shrink-0");
  expect(screen.getByTestId("right-arrow-slot")).toHaveClass("z-20", "h-8", "w-6", "shrink-0");

  // Initial state (scrollLeft === 0): left chevron at left edge + right gradient overlay
  const moveLeftButton = screen.getByRole("button", { name: "퀵 메시지 왼쪽으로 이동" });
  expect(moveLeftButton).toHaveClass("h-full", "w-full", "!px-2xs");
  expect(moveLeftButton).not.toHaveClass("absolute");
  expect(
    screen.queryByRole("button", { name: "퀵 메시지 오른쪽으로 이동" })
  ).not.toBeInTheDocument();

  const rightGradient = screen.getByTestId("right-gradient");
  expect(rightGradient).toHaveClass(
    "pointer-events-none",
    "absolute",
    "right-0",
    "w-[160px]",
    "h-[34px]",
    "from-surface-default",
    "to-transparent"
  );
  expect(screen.getByTestId("left-gradient")).toHaveClass(
    "opacity-0",
    "transition-opacity",
    "duration-200"
  );

  fireEvent.click(moveLeftButton);
  expect(scrollBy).toHaveBeenCalledWith({ left: 300, behavior: "smooth" });

  // Middle state (0 < scrollLeft < maxScrollLeft): both left and right chevrons + matching gradients
  Object.defineProperty(list, "scrollLeft", { configurable: true, value: 150 });
  fireEvent.scroll(list);

  const moveRightButtonInMiddle = screen.getByRole("button", { name: "퀵 메시지 오른쪽으로 이동" });
  expect(moveRightButtonInMiddle).toHaveClass("h-full", "w-full", "!px-2xs");
  expect(moveRightButtonInMiddle).not.toHaveClass("absolute");
  const leftGradient = screen.getByTestId("left-gradient");
  expect(leftGradient).toHaveClass(
    "pointer-events-none",
    "absolute",
    "left-0",
    "w-[160px]",
    "h-[34px]",
    "from-surface-default",
    "to-transparent"
  );
  expect(screen.getByRole("button", { name: "퀵 메시지 왼쪽으로 이동" })).toBeInTheDocument();
  expect(leftGradient).toHaveClass("opacity-100", "transition-opacity", "duration-200");
  expect(screen.getByTestId("right-gradient")).toHaveClass(
    "opacity-100",
    "transition-opacity",
    "duration-200"
  );

  // End state (scrollLeft === maxScrollLeft): right chevron at right edge + left gradient overlay
  Object.defineProperty(list, "scrollLeft", { configurable: true, value: 300 });
  fireEvent.scroll(list);

  expect(screen.queryByRole("button", { name: "퀵 메시지 왼쪽으로 이동" })).not.toBeInTheDocument();
  const moveRightButtonAtEnd = screen.getByRole("button", { name: "퀵 메시지 오른쪽으로 이동" });
  expect(moveRightButtonAtEnd).toBeInTheDocument();
  expect(screen.getByTestId("left-gradient")).toHaveClass(
    "opacity-100",
    "transition-opacity",
    "duration-200"
  );
  expect(screen.getByTestId("right-gradient")).toHaveClass(
    "opacity-0",
    "transition-opacity",
    "duration-200"
  );

  fireEvent.click(moveRightButtonAtEnd);
  expect(scrollBy).toHaveBeenLastCalledWith({ left: -300, behavior: "smooth" });
});
