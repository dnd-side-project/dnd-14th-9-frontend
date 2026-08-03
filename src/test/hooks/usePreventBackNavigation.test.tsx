import { StrictMode } from "react";

import { act, renderHook } from "@testing-library/react";

import { usePreventBackNavigation } from "@/hooks/usePreventBackNavigation";

describe("usePreventBackNavigation", () => {
  let pushStateSpy: jest.SpyInstance;

  beforeEach(() => {
    // 각 테스트 시작 시 현재 엔트리를 Next.js 관리 엔트리처럼 초기화
    window.history.replaceState({ __NA: true }, "");
    pushStateSpy = jest.spyOn(window.history, "pushState");
  });

  afterEach(() => {
    pushStateSpy.mockRestore();
  });

  it("StrictMode 이중 마운트에도 더미 엔트리는 한 번만 추가된다", () => {
    renderHook(() => usePreventBackNavigation(), { wrapper: StrictMode });

    expect(pushStateSpy).toHaveBeenCalledTimes(1);
  });

  it("더미 엔트리는 기존 히스토리 state(Next.js 내부 상태)를 보존한다", () => {
    renderHook(() => usePreventBackNavigation());

    const [state] = pushStateSpy.mock.calls[0];
    expect(state).toMatchObject({ __NA: true, preventBack: true });
  });

  it("현재 엔트리가 이미 더미면(왕복 복귀) 다시 추가하지 않는다", () => {
    window.history.replaceState({ __NA: true, preventBack: true }, "");

    renderHook(() => usePreventBackNavigation());

    expect(pushStateSpy).not.toHaveBeenCalled();
  });

  it("popstate 발생 시 다이얼로그를 열고 더미 엔트리를 재추가한다", () => {
    const { result } = renderHook(() => usePreventBackNavigation());
    pushStateSpy.mockClear();

    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate", { state: { __NA: true } }));
    });

    expect(result.current.showLeaveDialog).toBe(true);
    expect(pushStateSpy).toHaveBeenCalledTimes(1);
    expect(pushStateSpy.mock.calls[0][0]).toMatchObject({ preventBack: true });
  });

  it("isLeavingRef가 true면 popstate를 무시한다", () => {
    const { result } = renderHook(() => usePreventBackNavigation());
    result.current.isLeavingRef.current = true;
    pushStateSpy.mockClear();

    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate", { state: { __NA: true } }));
    });

    expect(result.current.showLeaveDialog).toBe(false);
    expect(pushStateSpy).not.toHaveBeenCalled();
  });
});
