import { act, render, screen } from "@testing-library/react";

import { useViewportLayout } from "@/hooks/useViewportLayout";

const addEventListenerSpy = jest.spyOn(window, "addEventListener");
const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");

function ViewportProbe({ label }: { label: string }) {
  const { layout, isResolved } = useViewportLayout();

  return (
    <div>
      <span>{label}</span>
      <output>{`${layout}:${isResolved ? "resolved" : "unresolved"}`}</output>
    </div>
  );
}

describe("useViewportLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: 1024,
    });
  });

  it("mount 시 현재 viewport layout을 읽고 resize listener를 등록한다", () => {
    const { unmount } = render(<ViewportProbe label="A" />);

    expect(addEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));
    expect(screen.getByText("tablet:resolved")).toBeInTheDocument();

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));
  });

  it("resize 시 최신 viewport layout을 읽는다", () => {
    render(<ViewportProbe label="A" />);

    act(() => {
      Object.defineProperty(window, "innerWidth", {
        configurable: true,
        writable: true,
        value: 375,
      });
      window.dispatchEvent(new Event("resize"));
    });

    expect(screen.getByText("mobile:resolved")).toBeInTheDocument();
  });
});
