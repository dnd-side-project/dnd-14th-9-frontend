"use client";

import { useEffect, useState } from "react";

import { toast, type ToastItem } from "@/lib/toast";

import { Toast } from "./Toast";

export function ToastViewport() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return toast.subscribe((event) => {
      if (event.type === "show") {
        setToasts((prev) => [...prev, event.toast]);
        return;
      }

      setToasts((prev) => prev.filter((toastItem) => toastItem.id !== event.id));
    });
  }, []);

  return (
    <div className="pointer-events-none fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toastItem) => (
        <Toast
          key={toastItem.id}
          id={toastItem.id}
          type={toastItem.type}
          message={toastItem.message}
          duration={toastItem.duration}
          onClose={toast.hideToast}
        />
      ))}
    </div>
  );
}
