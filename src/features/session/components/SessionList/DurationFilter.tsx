"use client";

import { useCallback, useRef } from "react";

import { Filter } from "@/components/Filter/Filter";
import { useClickOutside } from "@/hooks/useClickOutside";
import { cn } from "@/lib/utils/utils";

import { DURATION_OPTIONS } from "./sessionListFilter.types";
import { getDurationFilterLabel } from "./sessionListFilter.utils";

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
        className={cn("w-auto shrink-0", hasSelection && "text-text-primary")}
      >
        {triggerLabel}
      </Filter>

      {isOpen && (
        <div
          role="dialog"
          aria-label="진행 시간 선택"
          className="px-xl py-lg border-border-subtle bg-surface-default absolute top-full left-0 z-20 mt-3 w-[256px] rounded-sm border shadow-[0px_0px_2px_0px_#00000014,0px_16px_24px_0px_#0000001F]"
        >
          <ul role="radiogroup" className="gap-xs flex flex-col">
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
                    className="focus-visible:ring-primary text-text-secondary hover:text-text-primary gap-xs flex w-full items-center rounded-[4px] text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <span
                      className={cn(
                        "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-solid bg-transparent",
                        isSelected
                          ? "border-border-primary-default border-[4px]"
                          : "border-border-strong border-[1px]"
                      )}
                    />
                    <span className="text-[15px] leading-[1.4]">{option.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
