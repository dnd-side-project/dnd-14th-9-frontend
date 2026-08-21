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

  it("동일한 레이아웃 범위 내에서는 리렌더링을 유발하지 않는다", () => {
    const renderSpy = jest.fn();
    function RenderCountProbe() {
      const { layout } = useViewportLayout();
      renderSpy(layout);
      return <div>{layout}</div>;
    }

    render(<RenderCountProbe />);

    // 초기 마운트 시 renderSpy 호출 (desktop)
    expect(renderSpy).toHaveBeenCalledTimes(1);

    // 1024px (tablet)으로 변경 -> 1회 리렌더
    act(() => {
      observerCallback(
        [{ contentRect: { width: 1024 } } as ResizeObserverEntry],
        {} as ResizeObserver
      );
    });
    expect(renderSpy).toHaveBeenCalledTimes(2);

    // 동일 tablet 구간(1100px)으로 10회 변경
    act(() => {
      for (let w = 1025; w <= 1034; w++) {
        observerCallback(
          [{ contentRect: { width: w } } as ResizeObserverEntry],
          {} as ResizeObserver
        );
      }
    });

    // 레이아웃이 변하지 않았으므로 리렌더링 횟수는 2회 유지
    expect(renderSpy).toHaveBeenCalledTimes(2);
  });
});
