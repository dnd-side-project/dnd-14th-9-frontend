"use client";

import React, { useEffect, useState } from "react";

import { cn } from "@/lib/utils/utils";

import { useStepperSlide } from "./useStepperSlide";

import type { StepperSlideProps } from "./StepperSlide.types";

const TICK_VALUES = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const;

// 값 말풍선(w-13)과 내 집중도 말풍선(w-14)이 겹치기 시작하는 중심 간 거리(px)
const BUBBLE_OVERLAP_THRESHOLD_PX = 58;

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

  const [trackWidth, setTrackWidth] = useState<number | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const updateWidth = () => setTrackWidth(track.offsetWidth);
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(track);
    return () => observer.disconnect();
  }, [trackRef]);

  // 좁은 화면에서 값 말풍선과 겹치면 내 집중도 말풍선을 숨긴다(트랙 마커는 유지).
  const isMyFocusBubbleHidden =
    myFocusPercentage !== undefined &&
    trackWidth !== null &&
    (Math.abs(myFocusPercentage - percentage) / 100) * trackWidth < BUBBLE_OVERLAP_THRESHOLD_PX;

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
      {/* 말풍선 영역 */}
      <div className="relative mb-3 h-9.5">
        {/* 내 집중도 말풍선 */}
        {myFocusPercentage !== undefined && (
          <div
            className={cn(
              "absolute top-0 transition-opacity",
              isMyFocusBubbleHidden && "opacity-0"
            )}
            style={{ left: `${myFocusPercentage}%` }}
          >
            <div
              className={cn(
                "relative -translate-x-1/2",
                "flex h-8.75 w-14 items-center justify-center",
                "rounded-sm bg-gray-700 font-semibold whitespace-nowrap text-gray-200",
                "after:absolute after:top-full after:left-1/2 after:-translate-x-1/2",
                "after:border-4 after:border-transparent after:border-t-gray-700 after:content-['']"
              )}
            >
              <span className="px-xs box-border text-xs">{myFocusLabel}</span>
            </div>
          </div>
        )}

        {/* 현재 값 말풍선 */}
        <div className="absolute top-0" style={{ left: `${percentage}%` }}>
          <div
            className={cn(
              "relative -translate-x-1/2",
              "flex h-8.75 w-13 items-center justify-center",
              "rounded-sm bg-green-600 font-semibold",
              "after:absolute after:top-full after:left-1/2 after:-translate-x-1/2",
              "after:border-4 after:border-transparent after:border-t-green-600 after:content-['']",
              isDragging && "scale-110 transition-transform"
            )}
          >
            <div className="text-text-inverse text-base">{value}%</div>
          </div>
        </div>
      </div>

      {/* 슬라이더 트랙 */}
      <div
        ref={trackRef}
        className={cn("relative h-2 cursor-pointer rounded-full bg-gray-700")}
        onClick={handleTrackClick}
      >
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

        {/* 내 집중도 마커 */}
        {myFocusPercentage !== undefined && (
          <div
            className="absolute top-1/2 h-4 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-400"
            style={{ left: `${myFocusPercentage}%` }}
          />
        )}

        {/* 드래그 핸들 */}
        <div
          className={cn(
            "absolute top-1/2 -translate-x-1/2 -translate-y-1/2",
            "h-5 w-5 rounded-full",
            "border-common-white border-2 bg-green-600",
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

      {/* 격자선 및 숫자 */}
      <div className="relative mt-2 h-6 w-full">
        {TICK_VALUES.map((tick) => (
          <div
            key={tick}
            className="absolute flex -translate-x-1/2 transform flex-col items-center"
            style={{ left: `${tick}%` }}
          >
            {/* 격자선 */}
            <div className={cn("w-px", tick % 20 === 0 ? "h-3 bg-gray-400" : "h-2 bg-gray-600")} />

            {/* 20단위 숫자 */}
            {tick % 20 === 0 && <span className="mt-1 text-xs text-gray-400">{tick}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
