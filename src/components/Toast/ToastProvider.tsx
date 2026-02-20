"use client";

import { createContext, useCallback, useState, type ReactNode } from "react";

import { Toast, type ToastType } from "./Toast";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string, duration?: number) => void;
  hideToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((type: ToastType, message: string, duration = 3000) => {
    const id = `toast-${++toastId}`;
    setToasts((prev) => [...prev, { id, type, message, duration }]);
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            message={toast.message}
            duration={toast.duration}
            onClose={hideToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
