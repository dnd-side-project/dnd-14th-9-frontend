"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils/utils";

export interface CircularProgressBarProps extends ComponentPropsWithoutRef<"div"> {
  /** 진행률 (0-100) */
  progress: number;
  /** 크기 (px) */
  size?: number;
  /** 두께 (px) */
  strokeWidth?: number;
  /** 트랙 색상 클래스 */
  trackClassName?: string;
  /** 진행 색상 클래스 */
  indicatorClassName?: string;
  /** 중앙 텍스트 표시 여부 */
  showText?: boolean;
}

export const CircularProgressBar = forwardRef<HTMLDivElement, CircularProgressBarProps>(
  (
    {
      progress,
      size = 56,
      strokeWidth = 4,
      trackClassName = "stroke-gray-700",
      indicatorClassName = "stroke-green-100",
      showText = true,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const clampedProgress = Math.min(100, Math.max(0, progress));
    const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

    return (
      <div
        ref={ref}
        className={cn("relative inline-flex items-center justify-center", className)}
        style={{ width: size, height: size }}
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        {...props}
      >
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className={trackClassName}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={cn("transition-all duration-300 ease-in-out", indicatorClassName)}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
            }}
          />
        </svg>
        {showText && (
          <div className="absolute inset-0 flex items-center justify-center">
            {children || (
              <span className="text-sm font-semibold text-green-100">
                {Math.round(clampedProgress)}%
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

CircularProgressBar.displayName = "CircularProgressBar";
