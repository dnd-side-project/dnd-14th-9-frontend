import { useCallback, useEffect, useState } from "react";

import { AlertCircleIcon } from "@/components/Icon/AlertCircleIcon";
import { AlertTriangleIcon } from "@/components/Icon/AlertTriangleIcon";
import { CheckContainedIcon } from "@/components/Icon/CheckContainedIcon";
import { InformationCircleContainedIcon } from "@/components/Icon/InformationCircleContainedIcon";
import { XIcon } from "@/components/Icon/XIcon";
import type { ToastType } from "@/lib/toast";
import { cn } from "@/lib/utils/utils";

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  showClose?: boolean;
  duration?: number;
  onClose: (id: string) => void;
}

const TOAST_ICONS: Record<ToastType, React.ReactNode> = {
  info: (
    <InformationCircleContainedIcon size="small" className="text-[#6699ff]" aria-hidden="true" />
  ),
  success: <CheckContainedIcon size="small" className="text-[#4dcc66]" aria-hidden="true" />,
  warning: <AlertTriangleIcon size="small" className="text-[#ffcc4d]" aria-hidden="true" />,
  error: <AlertCircleIcon size="small" className="text-[#ff5959]" aria-hidden="true" />,
};

const TOAST_STYLES: Record<ToastType, string> = {
  info: "bg-[#1a2332] border-[#2a4a6b]",
  success: "bg-[#1a2e1a] border-[#2b5a2b]",
  warning: "bg-[#2e2a1a] border-[#5a4a2b]",
  error: "bg-[#2e1a1a] border-[#5a2b2b]",
};

export function Toast({
  id,
  type,
  title,
  description,
  showClose = true,
  duration = 3000,
  onClose,
}: ToastProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose(id);
    }, 200); // 200ms duration for exit animation to complete
  }, [id, onClose]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, handleClose]);

  return (
    <div
      className={cn(
        "pointer-events-auto flex w-full max-w-[400px] items-center gap-3 overflow-hidden rounded-lg border p-4 shadow-[0px_0px_2px_0px_#00000014,0px_16px_24px_0px_#0000001f] transition-[opacity,transform]",
        isClosing
          ? "animate-out fade-out slide-out-to-top-2 duration-200"
          : "animate-in slide-in-from-top-2 fade-in duration-300",
        TOAST_STYLES[type]
      )}
      role="alert"
    >
      <div className="flex-shrink-0">{TOAST_ICONS[type]}</div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="w-full text-sm leading-normal font-semibold break-words text-white">
          {title}
        </p>
        {description ? (
          <p className="w-full text-[13px] leading-[1.4] break-words text-[#b0b0b0]">
            {description}
          </p>
        ) : null}
      </div>
      {showClose ? (
        <button
          type="button"
          onClick={handleClose}
          className="flex-shrink-0 transition-colors"
          aria-label="닫기"
        >
          <XIcon size="xsmall" className="text-[#999999]" />
        </button>
      ) : null}
    </div>
  );
}
