import { useEffect } from "react";

import { CloseIcon } from "@/components/Icon/CloseIcon";
import { InfoIcon } from "@/components/Icon/InfoIcon";
import { cn } from "@/lib/utils/utils";

export type ToastType = "success" | "error" | "info";

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const TOAST_ICONS: Record<ToastType, React.ReactNode> = {
  success: <InfoIcon size="small" className="text-green-500" />,
  error: <InfoIcon size="small" className="text-red-500" />,
  info: <InfoIcon size="small" className="text-blue-500" />,
};

const TOAST_STYLES: Record<ToastType, string> = {
  success: "bg-green-500/10 border-green-500/20",
  error: "bg-red-500/10 border-red-500/20",
  info: "bg-blue-500/10 border-blue-500/20",
};

export function Toast({ id, type, message, duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div
      className={cn(
        "animate-in slide-in-from-top-2 fade-in pointer-events-auto flex max-w-md min-w-[320px] items-center gap-3 rounded-lg border p-4 shadow-lg transition-all",
        "bg-surface-default border-border-subtle",
        TOAST_STYLES[type]
      )}
      role="alert"
    >
      <div className="flex-shrink-0">{TOAST_ICONS[type]}</div>
      <p className="text-text-primary flex-1 text-sm font-medium">{message}</p>
      <button
        type="button"
        onClick={() => onClose(id)}
        className="text-text-muted hover:text-text-secondary flex-shrink-0 transition-colors"
        aria-label="닫기"
      >
        <CloseIcon size="xsmall" />
      </button>
    </div>
  );
}
