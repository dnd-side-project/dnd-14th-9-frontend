"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils/utils";

export interface ProgressBarProps extends ComponentPropsWithoutRef<"div"> {
  /** 진행률 (0-100) */
  progress: number;
  /** 트랙 색상 클래스 (기본: bg-gray-700) */
  trackClassName?: string;
  /** 진행 바 색상 클래스 (기본: bg-green-100) */
  indicatorClassName?: string;
}

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      progress,
      trackClassName = "bg-gray-700",
      indicatorClassName = "bg-green-100",
      className,
      ...props
    },
    ref
  ) => {
    const clampedProgress = Math.min(100, Math.max(0, progress));

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn("h-1.5 w-full overflow-hidden rounded-full", trackClassName, className)}
        {...props}
      >
        <div
          className={cn("h-full transition-[width] duration-300 ease-in-out", indicatorClassName)}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    );
  }
);

ProgressBar.displayName = "ProgressBar";
