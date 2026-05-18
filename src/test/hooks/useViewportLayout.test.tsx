import { act, render, screen } from "@testing-library/react";

import { useViewportLayout } from "@/hooks/useViewportLayout";

let observerCallback: ResizeObserverCallback;
const disconnectMock = jest.fn();
const observeMock = jest.fn();

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
    global.ResizeObserver = jest.fn((callback: ResizeObserverCallback) => {
      observerCallback = callback;
      return {
        observe: observeMock,
        disconnect: disconnectMock,
        unobserve: jest.fn(),
      };
    }) as unknown as typeof ResizeObserver;
  });

  it("mount 시 ResizeObserver로 document.documentElement를 관찰한다", () => {
    const { unmount } = render(<ViewportProbe label="A" />);

    act(() => {
      observerCallback(
        [{ contentRect: { width: 1024 } } as ResizeObserverEntry],
        {} as ResizeObserver
      );
    });

    expect(observeMock).toHaveBeenCalledWith(document.documentElement);
    expect(screen.getByText("tablet:resolved")).toBeInTheDocument();

    unmount();

    expect(disconnectMock).toHaveBeenCalled();
  });

  it("viewport 너비 변경 시 최신 레이아웃을 반환한다", () => {
    render(<ViewportProbe label="A" />);

    act(() => {
      observerCallback(
        [{ contentRect: { width: 375 } } as ResizeObserverEntry],
        {} as ResizeObserver
      );
    });

    expect(screen.getByText("mobile:resolved")).toBeInTheDocument();
  });
});
