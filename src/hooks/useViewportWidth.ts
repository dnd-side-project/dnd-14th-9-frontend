"use client";

import { useSyncExternalStore } from "react";

type ViewportWidthListener = () => void;

const listeners = new Set<ViewportWidthListener>();
let isSubscribed = false;

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function startListening() {
  if (isSubscribed || typeof window === "undefined") {
    return;
  }

  window.addEventListener("resize", notifyListeners);
  isSubscribed = true;
}

function stopListening() {
  if (!isSubscribed || typeof window === "undefined") {
    return;
  }

  window.removeEventListener("resize", notifyListeners);
  isSubscribed = false;
}

function subscribe(listener: ViewportWidthListener) {
  listeners.add(listener);
  startListening();

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0) {
      stopListening();
    }
  };
}

function getSnapshot() {
  return typeof window === "undefined" ? null : window.innerWidth;
}

function getServerSnapshot() {
  return null;
}

export function useViewportWidth() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
