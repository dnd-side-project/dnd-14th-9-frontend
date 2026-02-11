"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils/utils";

export interface ProgressRingProps extends ComponentPropsWithoutRef<"div"> {
  /** 진행률 (0-100) */
  progress: number;
  /** 링 크기 (px) */
  size?: number;
  /** 링 두께 (px) */
  strokeWidth?: number;
  /** 트랙 색상 클래스 */
  trackClassName?: string;
  /** 진행 색상 클래스 */
  progressClassName?: string;
  /** 퍼센트 텍스트 표시 여부 */
  showPercent?: boolean;
}

export const ProgressRing = forwardRef<HTMLDivElement, ProgressRingProps>(
  (
    {
      progress,
      size = 80,
      strokeWidth = 8,
      trackClassName = "stroke-gray-700",
      progressClassName = "stroke-green-600",
      showPercent = true,
      className,
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
        aria-label={`${Math.round(clampedProgress)}% 완료`}
        {...props}
      >
        <svg width={size} height={size} className="rotate-[-90deg]">
          {/* 배경 트랙 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className={trackClassName}
          />
          {/* 진행 바 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={cn(progressClassName, "transition-all duration-300")}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
            }}
          />
        </svg>
        {/* 중앙 퍼센트 텍스트 */}
        {showPercent && (
          <span className="text-text-primary absolute text-lg font-semibold">
            {Math.round(clampedProgress)}%
          </span>
        )}
      </div>
    );
  }
);

ProgressRing.displayName = "ProgressRing";
