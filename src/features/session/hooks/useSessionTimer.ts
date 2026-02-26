"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface TimerState {
  elapsedSeconds: number;
  focusedSeconds: number;
  isFocusing: boolean;
  isRunning: boolean;
}

interface StoredTimerState extends TimerState {
  lastSavedAt: number;
}

interface UseSessionTimerOptions {
  sessionId: string;
  maxSeconds: number;
  autoStart?: boolean;
}

interface UseSessionTimerReturn {
  elapsedSeconds: number;
  focusedSeconds: number;
  isFocusing: boolean;
  isRunning: boolean;
  formatted: string;
  focusRate: number;
  progress: number;
  start: () => void;
  pause: () => void;
}

const STORAGE_KEY_PREFIX = "session-timer:";

function getStorageKey(sessionId: string) {
  return `${STORAGE_KEY_PREFIX}${sessionId}`;
}

function loadTimerState(sessionId: string): StoredTimerState | null {
  try {
    const raw = localStorage.getItem(getStorageKey(sessionId));
    if (!raw) return null;
    return JSON.parse(raw) as StoredTimerState;
  } catch {
    return null;
  }
}

function saveTimerState(sessionId: string, state: TimerState) {
  try {
    const stored: StoredTimerState = { ...state, lastSavedAt: Date.now() };
    localStorage.setItem(getStorageKey(sessionId), JSON.stringify(stored));
  } catch {
    // localStorage full or unavailable
  }
}

export function clearTimerState(sessionId: string) {
  try {
    localStorage.removeItem(getStorageKey(sessionId));
  } catch {
    // localStorage unavailable
  }
}

/**
 * 세션 타이머 상태를 localStorage에서 읽어옵니다.
 * 세션 완료 시 결과 전송을 위해 사용됩니다.
 */
export function getTimerState(
  sessionId: string,
  maxSeconds: number
): { focusedSeconds: number; elapsedSeconds: number } | null {
  const state = loadTimerState(sessionId);
  if (!state) return null;

  let savedElapsed = state.elapsedSeconds;
  let savedFocused = state.focusedSeconds;

  // 이전에 running 상태였으면 경과 시간 추가
  if (state.isRunning && state.lastSavedAt > 0) {
    const gap = Math.floor((Date.now() - state.lastSavedAt) / 1000);
    const addedTime = Math.max(0, gap);
    savedElapsed = Math.min(savedElapsed + addedTime, maxSeconds);
    if (state.isFocusing) {
      savedFocused = savedFocused + addedTime;
    }
  }

  // focusedSeconds는 elapsedSeconds를 초과할 수 없다
  savedFocused = Math.min(savedFocused, savedElapsed);

  return { focusedSeconds: savedFocused, elapsedSeconds: savedElapsed };
}

function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return hours > 0
    ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function restoreTimerState(sessionId: string, maxSeconds: number, autoStart: boolean): TimerState {
  const saved = loadTimerState(sessionId);

  if (!saved) {
    return { elapsedSeconds: 0, focusedSeconds: 0, isFocusing: autoStart, isRunning: autoStart };
  }

  let savedElapsed = saved.elapsedSeconds;
  let savedFocused = saved.focusedSeconds;

  // 이전에 running 상태였으면 경과 시간 추가
  if (saved.isRunning && saved.lastSavedAt > 0) {
    const gap = Math.floor((Date.now() - saved.lastSavedAt) / 1000);
    const addedTime = Math.max(0, gap);
    savedElapsed = Math.min(savedElapsed + addedTime, maxSeconds);
    if (saved.isFocusing) {
      savedFocused = savedFocused + addedTime;
    }
  }

  // focusedSeconds는 elapsedSeconds를 초과할 수 없다
  savedFocused = Math.min(savedFocused, savedElapsed);

  return {
    elapsedSeconds: savedElapsed,
    focusedSeconds: savedFocused,
    isFocusing: saved.isFocusing,
    isRunning: savedElapsed < maxSeconds ? saved.isRunning : false,
  };
}

const SSR_DEFAULT: TimerState = {
  elapsedSeconds: 0,
  focusedSeconds: 0,
  isFocusing: true,
  isRunning: false,
};

export function useSessionTimer({
  sessionId,
  maxSeconds,
  autoStart = true,
}: UseSessionTimerOptions): UseSessionTimerReturn {
  const [state, setState] = useState<TimerState>(() => {
    if (typeof window === "undefined") return SSR_DEFAULT;
    return restoreTimerState(sessionId, maxSeconds, autoStart);
  });
  const lastTickRef = useRef<number>(0);

  // 시간 델타를 적용하는 공통 함수
  const applyDelta = useCallback(
    (delta: number, countFocus: boolean) => {
      setState((prev) => {
        if (!prev.isRunning) return prev;

        const nextElapsed = Math.min(prev.elapsedSeconds + delta, maxSeconds);
        const focusDelta = countFocus && prev.isFocusing ? delta : 0;
        const nextFocused = Math.min(prev.focusedSeconds + focusDelta, nextElapsed);

        if (nextElapsed >= maxSeconds) {
          const next: TimerState = {
            ...prev,
            elapsedSeconds: maxSeconds,
            focusedSeconds: nextFocused,
            isRunning: false,
            isFocusing: false,
          };
          saveTimerState(sessionId, next);
          return next;
        }

        const next: TimerState = {
          ...prev,
          elapsedSeconds: nextElapsed,
          focusedSeconds: nextFocused,
        };
        saveTimerState(sessionId, next);
        return next;
      });
    },
    [maxSeconds, sessionId]
  );

  // 매 초 타이머 틱 - 시간 델타 기반으로 백그라운드 탭에서도 정확한 시간 계산
  useEffect(() => {
    if (!state.isRunning) return;

    lastTickRef.current = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const delta = Math.floor((now - lastTickRef.current) / 1000);
      if (delta < 1) return;
      lastTickRef.current += delta * 1000;

      const isVisible = document.visibilityState === "visible";
      applyDelta(delta, isVisible);
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isRunning, maxSeconds, sessionId, applyDelta]);

  // 탭이 다시 보일 때 즉시 시간 보정
  useEffect(() => {
    if (!state.isRunning) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // 백그라운드에서 경과한 시간을 elapsedSeconds에만 반영 (집중 시간 미포함)
        const now = Date.now();
        const delta = Math.floor((now - lastTickRef.current) / 1000);
        if (delta < 1) return;
        lastTickRef.current += delta * 1000;
        applyDelta(delta, false);
      } else {
        // 탭이 숨겨질 때 현재 상태를 localStorage에 저장 (탭 종료 대비)
        setState((prev) => {
          saveTimerState(sessionId, prev);
          return prev;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [state.isRunning, maxSeconds, sessionId, applyDelta]);

  const start = useCallback(() => {
    setState((prev) => {
      const next: TimerState = { ...prev, isRunning: true, isFocusing: true };
      saveTimerState(sessionId, next);
      return next;
    });
  }, [sessionId]);

  const pause = useCallback(() => {
    setState((prev) => {
      const next: TimerState = { ...prev, isRunning: false, isFocusing: false };
      saveTimerState(sessionId, next);
      return next;
    });
  }, [sessionId]);

  const progress = maxSeconds > 0 ? Math.min((state.elapsedSeconds / maxSeconds) * 100, 100) : 0;
  const focusRate =
    state.elapsedSeconds > 0
      ? Math.min(Math.round((state.focusedSeconds / state.elapsedSeconds) * 100), 100)
      : 100;
  const formatted = formatTime(state.elapsedSeconds);

  return {
    elapsedSeconds: state.elapsedSeconds,
    focusedSeconds: state.focusedSeconds,
    isFocusing: state.isFocusing,
    isRunning: state.isRunning,
    formatted,
    focusRate,
    progress,
    start,
    pause,
  };
}
