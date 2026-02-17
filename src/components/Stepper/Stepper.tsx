"use client";

import { forwardRef, useCallback } from "react";

import { MinusIcon } from "@/components/Icon/MinusIcon";
import { PlusIcon } from "@/components/Icon/PlusIcon";
import { cn } from "@/lib/utils/utils";

import type { StepperProps } from "./Stepper.types";

export const Stepper = forwardRef<HTMLDivElement, StepperProps>(
  (
    {
      label,
      hint,
      value,
      onChange,
      min,
      max,
      step = 1,
      formatDisplay,
      disabled = false,
      className,
    },
    ref
  ) => {
    const canDecrement = value > min;
    const canIncrement = value < max;

    const handleDecrement = useCallback(() => {
      if (canDecrement && !disabled) {
        onChange(Math.max(min, value - step));
      }
    }, [canDecrement, disabled, onChange, min, value, step]);

    const handleIncrement = useCallback(() => {
      if (canIncrement && !disabled) {
        onChange(Math.min(max, value + step));
      }
    }, [canIncrement, disabled, onChange, max, value, step]);

    return (
      <div ref={ref} className={cn("flex flex-col gap-2", className)}>
        {/* 라벨 + 힌트 */}
        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-base">{label}</span>
          {hint && <span className="text-text-muted text-sm">{hint}</span>}
        </div>

        {/* 스테퍼 컨트롤 */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={!canDecrement || disabled}
            className={cn(
              "p-xs flex h-7 w-7 items-center justify-center rounded-xs border transition-colors",
              canDecrement && !disabled
                ? "cursor-pointer border-gray-600 bg-transparent text-gray-300"
                : "cursor-not-allowed border-gray-800 bg-gray-900 text-gray-800"
            )}
            aria-label="감소"
          >
            <MinusIcon size="xsmall" />
          </button>

          <span className="text-text-secondary min-w-20 text-center text-base font-medium">
            {formatDisplay(value)}
          </span>

          <button
            type="button"
            onClick={handleIncrement}
            disabled={!canIncrement || disabled}
            className={cn(
              "p-xs flex h-7 w-7 items-center justify-center rounded-xs border transition-colors",
              canIncrement && !disabled
                ? "cursor-pointer border-gray-600 bg-transparent text-gray-300"
                : "cursor-not-allowed border-gray-800 bg-gray-900 text-gray-800"
            )}
            aria-label="증가"
          >
            <PlusIcon size="xsmall" />
          </button>
        </div>
      </div>
    );
  }
);

Stepper.displayName = "Stepper";
