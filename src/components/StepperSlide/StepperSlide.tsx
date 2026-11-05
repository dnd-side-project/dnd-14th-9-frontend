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
      {/* 말풍선 + 최소/최대 라벨 영역 (시안: 트랙 위 50.4px, 라벨 하단 2.3px, 말풍선 위 2.6px) */}
      <div className="relative h-[50.4px]">
        <span className="text-text-disabled absolute bottom-[2.3px] left-0 text-xs font-semibold">
          {min}
        </span>
        <span className="text-text-disabled absolute right-0 bottom-[2.3px] text-xs font-semibold">
          {max}
        </span>

        {/* 현재 값 말풍선 */}
        <div className="absolute top-[2.6px]" style={{ left: `${percentage}%` }}>
          <div
            className={cn(
              "relative -translate-x-1/2",
              "flex items-center justify-center px-3 py-2",
              "bg-surface-primary-alpha-default rounded-sm font-semibold",
              isDragging && "scale-110 transition-transform"
            )}
          >
            <div className="text-text-brand-default text-xs">{value}%</div>
            {/* 아래쪽(핸들 방향) 꼬리: 시안 28x6 */}
            <div className="border-t-surface-primary-alpha-default absolute top-full left-1/2 -translate-x-1/2 border-x-[14px] border-t-[6px] border-x-transparent" />
          </div>
        </div>
      </div>

      {/* 슬라이더 트랙 */}
      <div
        ref={trackRef}
        className={cn("bg-border-default relative h-1.5 cursor-pointer rounded-full")}
        onClick={handleTrackClick}
      >
        {/* 내 값 채움 (현재 값 채움 아래 레이어) */}
        {myFocusPercentage !== undefined && (
          <div
            className="bg-border-strong absolute top-0 left-0 h-full rounded-full"
            style={{ width: `${myFocusPercentage}%` }}
          />
        )}

        {/* 채워진 영역 */}
        <div
          className="bg-border-primary-subtler absolute top-0 left-0 h-full rounded-full"
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
            // 시안: 10px 점 + 바깥 4px 테두리(border/gray/subtler) + 그림자 2겹. 그림자는 테두리까지 포함한 모양에서 퍼지므로 spread 4.
            // 조작 편의를 위해 ::before로 클릭 영역을 넓힌다.
            "bg-surface-primary-default h-2.5 w-2.5 rounded-full",
            "shadow-[0_0_0_4px_var(--color-border-gray-subtler),0_8px_16px_4px_rgba(0,0,0,0.12),0_0_2px_4px_rgba(0,0,0,0.08)]",
            "before:absolute before:-inset-3",
            "cursor-grab focus:ring-2 focus:ring-green-400 focus:outline-none",
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

      {/* 내 값 말풍선 (트랙 아래: 꼬리 6 + 몸통 33, 시안 69x39). 아래 3.5px는 시안 슬라이더 높이(102.6)에 맞춘 여백 */}
      {myFocusPercentage !== undefined && (
        <div className="relative mt-[3.9px] h-[42.3px] w-full">
          <div
            className="absolute top-0 -translate-x-1/2"
            style={{ left: `clamp(2.25rem, ${myFocusPercentage}%, calc(100% - 2.25rem))` }}
          >
            {/* 위쪽(트랙 방향) 꼬리: 시안 28x6 */}
            <div className="border-b-surface-strong absolute top-0 left-1/2 -translate-x-1/2 border-x-[14px] border-b-[6px] border-x-transparent" />
            <span className="text-text-tertiary bg-surface-strong relative mt-1.5 flex items-center justify-center rounded-sm px-3 py-2 text-xs font-semibold whitespace-nowrap">
              {myFocusLabel}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
