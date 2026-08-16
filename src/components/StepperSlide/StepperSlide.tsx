"use client";

import React from "react";

import { cn } from "@/lib/utils/utils";

import { useStepperSlide } from "./useStepperSlide";

import type { StepperSlideProps } from "./StepperSlide.types";

export function StepperSlide({
  value,
  onChange,
  myFocusValue,
  myFocusLabel = "내 집중도",
  limit,
  min = 0,
  max = 100,
  disabled = false,
  className,
  ref,
}: StepperSlideProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    isDragging,
    percentage,
    selectableMax,
    trackRef,
    handleMouseDown,
    handleTrackClick,
    handleKeyDown,
  } = useStepperSlide({
    value,
    onChange,
    min,
    max,
    limit,
    disabled,
  });

  const myFocusPercentage =
    myFocusValue !== undefined ? ((myFocusValue - min) / (max - min)) * 100 : undefined;

  // 선택할 수 없는 구간(상한 초과)을 트랙 위에 흐리게 표시한다.
  const limitPercentage =
    limit !== undefined ? ((selectableMax - min) / (max - min)) * 100 : undefined;

  return (
    <div
      ref={ref}
      className={cn(
        "relative w-full select-none",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      {/* 말풍선 + 최소/최대 라벨 영역 */}
      <div className="relative mb-2 h-11">
        <span className="absolute bottom-0 left-0 text-xs text-gray-400">{min}</span>
        <span className="absolute right-0 bottom-0 text-xs text-gray-400">{max}</span>

        {/* 현재 값 말풍선 */}
        <div className="absolute top-0" style={{ left: `${percentage}%` }}>
          <div
            className={cn(
              "relative -translate-x-1/2",
              "flex h-8.75 w-13 items-center justify-center",
              "bg-surface-primary-alpha-default rounded-sm font-semibold",
              isDragging && "scale-110 transition-transform"
            )}
          >
            <div className="text-text-brand-default text-xs">{value}%</div>
            {/* 아래쪽(핸들 방향) 꼬리 */}
            <div className="border-t-surface-primary-alpha-default absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent" />
          </div>
        </div>
      </div>

      {/* 슬라이더 트랙 */}
      <div
        ref={trackRef}
        className={cn("relative h-2 cursor-pointer rounded-full bg-gray-700")}
        onClick={handleTrackClick}
      >
        {/* 내 값 채움 (현재 값 채움 아래 레이어) */}
        {myFocusPercentage !== undefined && (
          <div
            className="absolute top-0 left-0 h-full rounded-full bg-gray-500"
            style={{ width: `${myFocusPercentage}%` }}
          />
        )}

        {/* 채워진 영역 */}
        <div
          className="absolute top-0 left-0 h-full rounded-full bg-green-600"
          style={{ width: `${percentage}%` }}
        />

        {/* 선택 불가 구간 */}
        {limitPercentage !== undefined && limitPercentage < 100 && (
          <div
            className="absolute top-0 h-full rounded-r-full bg-gray-800"
            style={{ left: `${limitPercentage}%`, width: `${100 - limitPercentage}%` }}
          />
        )}

        {/* 드래그 핸들 */}
        <div
          className={cn(
            "absolute top-1/2 -translate-x-1/2 -translate-y-1/2",
            "h-5 w-5 rounded-full",
            "border-border-gray-subtler border-[5px] bg-green-600",
            "cursor-grab shadow-[0_0_8px_0_#00000029]",
            "focus:ring-2 focus:ring-green-400 focus:outline-none",
            isDragging && "scale-110 cursor-grabbing"
          )}
          style={{ left: `${percentage}%` }}
          onMouseDown={handleMouseDown}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={selectableMax}
          aria-valuenow={value}
          aria-disabled={disabled}
        />
      </div>

      {/* 내 값 말풍선 (트랙 아래, 69x39) */}
      {myFocusPercentage !== undefined && (
        <div className="relative mt-2 h-9.75 w-full">
          <div
            className="absolute top-0 -translate-x-1/2"
            style={{ left: `clamp(2.25rem, ${myFocusPercentage}%, calc(100% - 2.25rem))` }}
          >
            <span className="text-text-tertiary bg-surface-strong relative flex h-9.75 w-17.25 items-center justify-center rounded-sm text-xs font-semibold whitespace-nowrap">
              {myFocusLabel}
            </span>
            {/* 위쪽(트랙 방향) 꼬리 */}
            <div className="border-b-surface-strong absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent" />
          </div>
        </div>
      )}
    </div>
  );
}
