"use client";

import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";

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
  /** 중앙 콘텐츠 */
  children?: ReactNode;
}

export const ProgressRing = forwardRef<HTMLDivElement, ProgressRingProps>(
  (
    {
      progress,
      size = 42,
      strokeWidth = 4,
      trackClassName = "stroke-gray-700",
      progressClassName = "stroke-green-600",
      showPercent = true,
      children,
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
            className={cn(progressClassName, "transition-[stroke-dashoffset] duration-300")}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
            }}
          />
        </svg>
        {/* 중앙 퍼센트 텍스트 */}
        {showPercent && (
          <div className="absolute inset-0 flex items-center justify-center">
            {children || (
              <span className="text-[10px] font-semibold text-gray-300">
                {Math.round(clampedProgress)}%
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

ProgressRing.displayName = "ProgressRing";
