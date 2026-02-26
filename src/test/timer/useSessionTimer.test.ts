import { renderHook, act } from "@testing-library/react";

import {
  getTimerState,
  clearTimerState,
  useSessionTimer,
} from "../../features/session/hooks/useSessionTimer";

const STORAGE_KEY_PREFIX = "session-timer:";
const SESSION_ID = "test-session";
const MAX_SECONDS = 60; // 1분 세션

interface StoredTimerState {
  elapsedSeconds: number;
  focusedSeconds: number;
  isFocusing: boolean;
  isRunning: boolean;
  lastSavedAt: number;
}

function setStoredState(sessionId: string, state: StoredTimerState) {
  localStorage.setItem(`${STORAGE_KEY_PREFIX}${sessionId}`, JSON.stringify(state));
}

beforeEach(() => {
  localStorage.clear();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("getTimerState", () => {
  it("localStorage에 상태가 없으면 null을 반환한다", () => {
    expect(getTimerState(SESSION_ID, MAX_SECONDS)).toBeNull();
  });

  it("정지 상태일 때 저장된 값을 그대로 반환한다", () => {
    setStoredState(SESSION_ID, {
      elapsedSeconds: 30,
      focusedSeconds: 20,
      isFocusing: false,
      isRunning: false,
      lastSavedAt: Date.now() - 5000,
    });

    const result = getTimerState(SESSION_ID, MAX_SECONDS);

    expect(result).toEqual({ elapsedSeconds: 30, focusedSeconds: 20 });
  });

  it("실행 중일 때 경과 시간을 추가한다", () => {
    jest.setSystemTime(new Date("2025-01-01T00:00:10.000Z"));

    setStoredState(SESSION_ID, {
      elapsedSeconds: 30,
      focusedSeconds: 30,
      isFocusing: true,
      isRunning: true,
      lastSavedAt: new Date("2025-01-01T00:00:00.000Z").getTime(), // 10초 전
    });

    const result = getTimerState(SESSION_ID, MAX_SECONDS);

    expect(result).toEqual({ elapsedSeconds: 40, focusedSeconds: 40 });
  });

  it("elapsedSeconds가 maxSeconds를 초과하지 않도록 클램핑한다", () => {
    jest.setSystemTime(new Date("2025-01-01T00:01:00.000Z"));

    setStoredState(SESSION_ID, {
      elapsedSeconds: 50,
      focusedSeconds: 50,
      isFocusing: true,
      isRunning: true,
      lastSavedAt: new Date("2025-01-01T00:00:00.000Z").getTime(), // 60초 전 -> 50+60=110 > maxSeconds(60)
    });

    const result = getTimerState(SESSION_ID, MAX_SECONDS);

    expect(result!.elapsedSeconds).toBe(MAX_SECONDS);
  });

  it("focusedSeconds가 elapsedSeconds를 초과하지 않도록 클램핑한다", () => {
    jest.setSystemTime(new Date("2025-01-01T00:01:00.000Z"));

    // 집중 중이었고 60초가 경과 -> focusedSeconds = 50+60=110, elapsedSeconds = min(50+60, 60) = 60
    setStoredState(SESSION_ID, {
      elapsedSeconds: 50,
      focusedSeconds: 50,
      isFocusing: true,
      isRunning: true,
      lastSavedAt: new Date("2025-01-01T00:00:00.000Z").getTime(),
    });

    const result = getTimerState(SESSION_ID, MAX_SECONDS);

    expect(result!.focusedSeconds).toBeLessThanOrEqual(result!.elapsedSeconds);
    expect(result!.focusedSeconds).toBe(MAX_SECONDS);
    expect(result!.elapsedSeconds).toBe(MAX_SECONDS);
  });

  it("집중하지 않는 상태에서는 focusedSeconds가 증가하지 않는다", () => {
    jest.setSystemTime(new Date("2025-01-01T00:00:10.000Z"));

    setStoredState(SESSION_ID, {
      elapsedSeconds: 30,
      focusedSeconds: 20,
      isFocusing: false,
      isRunning: true,
      lastSavedAt: new Date("2025-01-01T00:00:00.000Z").getTime(),
    });

    const result = getTimerState(SESSION_ID, MAX_SECONDS);

    expect(result).toEqual({ elapsedSeconds: 40, focusedSeconds: 20 });
  });
});

describe("clearTimerState", () => {
  it("localStorage에서 타이머 상태를 제거한다", () => {
    setStoredState(SESSION_ID, {
      elapsedSeconds: 30,
      focusedSeconds: 20,
      isFocusing: false,
      isRunning: false,
      lastSavedAt: Date.now(),
    });

    clearTimerState(SESSION_ID);

    expect(getTimerState(SESSION_ID, MAX_SECONDS)).toBeNull();
  });
});

describe("useSessionTimer", () => {
  it("localStorage에 상태가 없으면 초기값으로 시작한다", () => {
    const { result } = renderHook(() =>
      useSessionTimer({ sessionId: SESSION_ID, maxSeconds: MAX_SECONDS, autoStart: true })
    );

    // useEffect에서 restoreTimerState 실행
    act(() => {
      jest.advanceTimersByTime(0);
    });

    expect(result.current.elapsedSeconds).toBe(0);
    expect(result.current.focusedSeconds).toBe(0);
    expect(result.current.formatted).toBe("00:00");
  });

  it("복원 시 focusedSeconds가 elapsedSeconds를 초과하지 않는다", () => {
    jest.setSystemTime(new Date("2025-01-01T00:01:00.000Z"));

    // 비정상 상태: focusedSeconds > elapsedSeconds가 될 수 있는 조건
    setStoredState(SESSION_ID, {
      elapsedSeconds: 50,
      focusedSeconds: 50,
      isFocusing: true,
      isRunning: true,
      lastSavedAt: new Date("2025-01-01T00:00:00.000Z").getTime(), // 60초 전
    });

    const { result } = renderHook(() =>
      useSessionTimer({ sessionId: SESSION_ID, maxSeconds: MAX_SECONDS, autoStart: true })
    );

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(result.current.focusedSeconds).toBeLessThanOrEqual(result.current.elapsedSeconds);
  });

  it("focusRate가 100%를 초과하지 않는다", () => {
    jest.setSystemTime(new Date("2025-01-01T00:01:00.000Z"));

    setStoredState(SESSION_ID, {
      elapsedSeconds: 50,
      focusedSeconds: 50,
      isFocusing: true,
      isRunning: true,
      lastSavedAt: new Date("2025-01-01T00:00:00.000Z").getTime(),
    });

    const { result } = renderHook(() =>
      useSessionTimer({ sessionId: SESSION_ID, maxSeconds: MAX_SECONDS, autoStart: true })
    );

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(result.current.focusRate).toBeLessThanOrEqual(100);
  });

  it("progress가 100%를 초과하지 않는다", () => {
    setStoredState(SESSION_ID, {
      elapsedSeconds: MAX_SECONDS,
      focusedSeconds: MAX_SECONDS,
      isFocusing: false,
      isRunning: false,
      lastSavedAt: Date.now(),
    });

    const { result } = renderHook(() =>
      useSessionTimer({ sessionId: SESSION_ID, maxSeconds: MAX_SECONDS, autoStart: true })
    );

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(result.current.progress).toBeLessThanOrEqual(100);
  });

  it("maxSeconds 도달 시 타이머가 멈춘다", () => {
    setStoredState(SESSION_ID, {
      elapsedSeconds: MAX_SECONDS - 1,
      focusedSeconds: MAX_SECONDS - 1,
      isFocusing: true,
      isRunning: true,
      lastSavedAt: Date.now(),
    });

    const { result } = renderHook(() =>
      useSessionTimer({ sessionId: SESSION_ID, maxSeconds: MAX_SECONDS, autoStart: true })
    );

    // restoreTimerState 실행
    act(() => {
      jest.runOnlyPendingTimers();
    });

    // 1초 경과 -> maxSeconds 도달
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.elapsedSeconds).toBe(MAX_SECONDS);
    expect(result.current.isRunning).toBe(false);
    expect(result.current.isFocusing).toBe(false);
  });
});
