"use client";

import { useState, useEffect, useCallback } from "react";

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
  sessionId: string
): { focusedSeconds: number; elapsedSeconds: number } | null {
  const state = loadTimerState(sessionId);
  if (!state) return null;

  let savedElapsed = state.elapsedSeconds;
  let savedFocused = state.focusedSeconds;

  // 이전에 running 상태였으면 경과 시간 추가
  if (state.isRunning && state.lastSavedAt > 0) {
    const gap = Math.floor((Date.now() - state.lastSavedAt) / 1000);
    const addedTime = Math.max(0, gap);
    savedElapsed = savedElapsed + addedTime;
    if (state.isFocusing) {
      savedFocused = savedFocused + addedTime;
    }
  }

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
  const [state, setState] = useState<TimerState>(SSR_DEFAULT);

  // 클라이언트 mount 후 localStorage에서 복원 (hydration mismatch 방지)
  useEffect(() => {
    setState(restoreTimerState(sessionId, maxSeconds, autoStart));
  }, [sessionId, maxSeconds, autoStart]);

  // 매 초 타이머 틱 + localStorage 저장 (단일 setState 콜백 내에서 처리)
  useEffect(() => {
    if (!state.isRunning) return;

    const interval = setInterval(() => {
      setState((prev) => {
        const nextElapsed = prev.elapsedSeconds + 1;

        if (nextElapsed >= maxSeconds) {
          const next: TimerState = {
            ...prev,
            elapsedSeconds: maxSeconds,
            isRunning: false,
            isFocusing: false,
          };
          saveTimerState(sessionId, next);
          return next;
        }

        const next: TimerState = {
          ...prev,
          elapsedSeconds: nextElapsed,
          focusedSeconds: prev.isFocusing ? prev.focusedSeconds + 1 : prev.focusedSeconds,
        };
        saveTimerState(sessionId, next);
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isRunning, maxSeconds, sessionId]);

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
      ? Math.round((state.focusedSeconds / state.elapsedSeconds) * 100)
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
