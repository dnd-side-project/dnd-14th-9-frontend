"use client";

import { type ComponentPropsWithoutRef, type ReactNode, useId } from "react";

import { cn } from "@/lib/utils/utils";

/** 타이머 종류별로 쓸 수 있는 상태 (Figma 변형과 동일). 지정하지 않으면 일반 진행 링으로 동작한다 */
type TimerVariant =
  | { scope: "my"; state: "default" | "running" | "paused" | "completed" }
  | { scope: "all"; state: "running" | "warning" | "completed" }
  | { scope?: undefined; state?: undefined };

interface TimerCircularBaseProps extends ComponentPropsWithoutRef<"div"> {
  /** 진행률 (0-100) */
  progress: number;
  /** Figma size 변형: 링 크기·두께·중앙 글자 크기를 한 번에 정한다 (직접 넘긴 size, strokeWidth가 우선) */
  preset?: TimerCirclePreset;
  /** 링 크기 (px) */
  size?: number;
  /** 링 두께 (px) */
  strokeWidth?: number;
  /** 트랙 색상 클래스 (scope/state 지정 시 무시) */
  trackClassName?: string;
  /** 진행 색상 클래스 (scope/state 지정 시 무시) */
  progressClassName?: string;
  /** 링 중앙에 보여줄 시간 (scope/state 지정 시) */
  time?: string;
  /** 퍼센트 텍스트 표시 여부 */
  showPercent?: boolean;
  /** 중앙 콘텐츠 */
  children?: ReactNode;
  ref?: React.Ref<HTMLDivElement>;
}

export type TimerCircularProps = TimerCircularBaseProps & TimerVariant;

type TimerCirclePreset = "sm" | "md";

// 두께 4.16은 150px 링의 6px을 104px로 줄인 같은 비율이다 (Figma size=sm)
const PRESETS: Record<
  TimerCirclePreset,
  { size: number; strokeWidth: number; timeTextClassName: string; completedTextClassName: string }
> = {
  sm: {
    size: 104,
    strokeWidth: 4.16,
    timeTextClassName: "text-lg",
    completedTextClassName: "text-base",
  },
  md: {
    size: 150,
    strokeWidth: 6,
    timeTextClassName: "text-2xl",
    completedTextClassName: "text-lg",
  },
};

interface VariantStyle {
  /** 호 그라디언트 시작·끝 색(text-* 클래스). 없으면 progressClassName 단색 */
  gradient?: { from: string; to: string };
  progressClassName?: string;
  textClassName: string;
}

const PRIMARY_GRADIENT = { from: "text-border-primary-subtler", to: "text-border-primary-default" };
const NEUTRAL_GRADIENT = { from: "text-border-strong", to: "text-border-stronger" };

const VARIANT_STYLES: Record<"my" | "all", Record<string, VariantStyle>> = {
  my: {
    default: { gradient: PRIMARY_GRADIENT, textClassName: "text-text-tertiary" },
    running: { gradient: PRIMARY_GRADIENT, textClassName: "text-text-brand-default" },
    paused: { progressClassName: "stroke-border-disabled/50", textClassName: "text-text-disabled" },
    completed: { gradient: PRIMARY_GRADIENT, textClassName: "text-text-brand-default" },
  },
  all: {
    running: { gradient: NEUTRAL_GRADIENT, textClassName: "text-text-primary" },
    warning: {
      progressClassName: "stroke-border-error-default",
      textClassName: "text-text-status-negative-default",
    },
    completed: { gradient: NEUTRAL_GRADIENT, textClassName: "text-text-primary" },
  },
};

/**
 * 진행 호 그라디언트의 시작·끝 좌표를 반환한다. (svg 회전 전 좌표계: 호는 3시 방향에서 시작해 시계 방향으로 진행)
 * - 방향: 호의 시작점 → 끝점을 잇는 직선 방향 (Figma 진행 중 샘플). 100%에서는 아래 → 위가 되어 Figma 완료 샘플과 같다.
 * - 길이: 호가 그 방향으로 차지하는 폭. 반원 이하는 시작점~끝점 거리, 반원을 넘으면 지름.
 * 선형 그라디언트의 색은 방향 축 위의 위치로만 정해지므로, 호 중심을 지나는 직선으로 둬도 시작점~끝점 직선과 똑같이 칠해진다.
 */
export function getGradientVector(cx: number, cy: number, radius: number, progress: number) {
  const theta = (2 * Math.PI * progress) / 100;
  const dx = -Math.sin(theta / 2);
  const dy = Math.cos(theta / 2);
  const half = radius * Math.sin(Math.min(theta, Math.PI) / 2);
  return { x1: cx - dx * half, y1: cy - dy * half, x2: cx + dx * half, y2: cy + dy * half };
}

export function TimerCircular({
  progress,
  preset,
  size: sizeProp,
  strokeWidth: strokeWidthProp,
  trackClassName = "stroke-gray-700",
  progressClassName = "stroke-green-600",
  scope,
  state,
  time,
  showPercent = true,
  children,
  className,
  ref,
  ...props
}: TimerCircularProps) {
  const gradientId = useId();
  const presetStyle = PRESETS[preset ?? "md"];
  const size = sizeProp ?? (preset ? presetStyle.size : 42);
  const strokeWidth = strokeWidthProp ?? (preset ? presetStyle.strokeWidth : 4);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  const variant = scope && state ? VARIANT_STYLES[scope][state] : undefined;
  const gradient = variant?.gradient;

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
        {gradient && (
          <defs>
            <linearGradient
              id={gradientId}
              gradientUnits="userSpaceOnUse"
              {...getGradientVector(size / 2, size / 2, radius, clampedProgress)}
            >
              <stop offset="0" className={gradient.from} style={{ stopColor: "currentColor" }} />
              <stop offset="1" className={gradient.to} style={{ stopColor: "currentColor" }} />
            </linearGradient>
          </defs>
        )}
        {/* 배경 트랙 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={variant ? "stroke-border-default" : trackClassName}
        />
        {/* 진행 바 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={gradient ? `url(#${gradientId})` : undefined}
          strokeWidth={strokeWidth}
          className={cn(
            !gradient && (variant ? variant.progressClassName : progressClassName),
            "transition-[stroke-dashoffset] duration-300"
          )}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
          }}
        />
      </svg>
      {/* 중앙 텍스트 */}
      {showPercent && (
        <div className="absolute inset-0 flex items-center justify-center">
          {variant ? (
            <span
              className={cn(
                "font-bold",
                state === "completed"
                  ? presetStyle.completedTextClassName
                  : presetStyle.timeTextClassName,
                variant.textClassName
              )}
            >
              {state === "completed" ? "세션 종료!" : time}
            </span>
          ) : (
            children || (
              <span className="text-[10px] font-semibold text-gray-300">
                {Math.round(clampedProgress)}%
              </span>
            )
          )}
        </div>
      )}
    </div>
  );
}
