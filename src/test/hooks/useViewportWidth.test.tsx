import { act, render, screen } from "@testing-library/react";

import { useViewportWidth } from "@/hooks/useViewportWidth";

const addEventListenerSpy = jest.spyOn(window, "addEventListener");
const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");

function ViewportProbe({ label }: { label: string }) {
  const viewportWidth = useViewportWidth();

  return (
    <div>
      <span>{label}</span>
      <output>{viewportWidth ?? "unresolved"}</output>
    </div>
  );
}

describe("useViewportWidth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: 1024,
    });
  });

  it("여러 소비자가 있어도 resize listener를 하나만 등록한다", () => {
    const { unmount } = render(
      <>
        <ViewportProbe label="A" />
        <ViewportProbe label="B" />
      </>
    );

    expect(addEventListenerSpy).toHaveBeenCalledTimes(1);
    expect(screen.getAllByText("1024")).toHaveLength(2);

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);
  });

  it("resize 시 모든 소비자가 같은 최신 width를 읽는다", () => {
    render(
      <>
        <ViewportProbe label="A" />
        <ViewportProbe label="B" />
      </>
    );

    act(() => {
      Object.defineProperty(window, "innerWidth", {
        configurable: true,
        writable: true,
        value: 375,
      });
      window.dispatchEvent(new Event("resize"));
    });

    expect(screen.getAllByText("375")).toHaveLength(2);
  });
});
