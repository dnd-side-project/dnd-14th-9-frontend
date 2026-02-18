"use client";

import { useCallback, useRef } from "react";

import { Filter } from "@/components/Filter/Filter";
import { CheckIcon } from "@/components/Icon/CheckIcon";
import { useClickOutside } from "@/hooks/useClickOutside";
import { cn } from "@/lib/utils/utils";

import { DURATION_OPTIONS } from "./recruitingFilter.types";
import { getDurationFilterLabel } from "./recruitingFilter.utils";

import type { DurationRange } from "../../types";

interface DurationFilterProps {
  isOpen: boolean;
  value: DurationRange | null;
  onOpenChange: (isOpen: boolean) => void;
  onSelect: (durationRange: DurationRange) => void;
}

export function DurationFilter({ isOpen, value, onOpenChange, onSelect }: DurationFilterProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const closeFilter = useCallback(() => onOpenChange(false), [onOpenChange]);
  useClickOutside(containerRef, closeFilter, isOpen);

  const hasSelection = Boolean(value);
  const triggerLabel = getDurationFilterLabel(value);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <Filter
        size="large"
        radius="sm"
        isOpen={isOpen}
        aria-haspopup="dialog"
        onClick={() => onOpenChange(!isOpen)}
        className={cn(
          "w-auto shrink-0",
          hasSelection && "text-text-primary",
          isOpen && ["border-text-brand-default", "shadow-[0_0_8px_0_#27EA674D]"]
        )}
      >
        {triggerLabel}
      </Filter>

      {isOpen && (
        <div
          role="dialog"
          aria-label="진행 시간 선택"
          className="p-xl absolute top-full left-0 z-20 mt-3 w-[256px] rounded-sm border border-gray-900 bg-gray-950"
        >
          <div className="flex flex-col gap-[20px]">
            <p className="text-[16px] leading-[1.4] font-semibold text-gray-300">진행 시간</p>
            <ul role="radiogroup" className="gap-md flex flex-col">
              {DURATION_OPTIONS.map((option) => {
                const isSelected = option.value === value;

                return (
                  <li key={option.value} className="w-full">
                    <button
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => {
                        onSelect(option.value);
                        onOpenChange(false);
                      }}
                      className="focus-visible:ring-primary text-text-secondary hover:text-text-primary gap-2xs flex w-full items-center rounded-[4px] text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
                    >
                      <span
                        className={cn(
                          "flex h-[18px] w-[18px] items-center justify-center rounded-full border",
                          isSelected
                            ? "border-[#007E4E] bg-[#003A23] text-[#27EA67]"
                            : "border-gray-600 bg-transparent text-transparent"
                        )}
                      >
                        <CheckIcon size="xsmall" />
                      </span>
                      <span className="text-[15px] leading-[1.4]">{option.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
