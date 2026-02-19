"use client";

import { useCallback, useRef } from "react";

import { Filter } from "@/components/Filter/Filter";
import { CheckIcon } from "@/components/Icon/CheckIcon";
import { useClickOutside } from "@/hooks/useClickOutside";
import { cn } from "@/lib/utils/utils";

import { getOptionLabel, SORT_OPTIONS } from "./sessionListFilter.types";

import type { SessionSort } from "../../types";

interface SortFilterProps {
  isOpen: boolean;
  value: SessionSort;
  onOpenChange: (isOpen: boolean) => void;
  onSelect: (sort: SessionSort) => void;
  className?: string;
}

export function SortFilter({ isOpen, value, onOpenChange, onSelect, className }: SortFilterProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const closeFilter = useCallback(() => onOpenChange(false), [onOpenChange]);
  useClickOutside(containerRef, closeFilter, isOpen);

  const triggerLabel = getOptionLabel(SORT_OPTIONS, value, "정렬");

  return (
    <div ref={containerRef} className={cn("relative shrink-0", className)}>
      <Filter
        size="medium"
        radius="sm"
        bordered={false}
        isOpen={isOpen}
        aria-haspopup="dialog"
        onClick={() => onOpenChange(!isOpen)}
        className="min-w-20"
      >
        {triggerLabel}
      </Filter>

      {isOpen && (
        <div
          role="dialog"
          aria-label="정렬 선택"
          className="p-xl absolute top-full right-0 z-20 mt-3 w-50 rounded-sm border border-gray-900 bg-gray-950"
        >
          <div className="flex flex-col gap-5">
            <p className="text-[16px] leading-[1.4] font-semibold text-gray-300">정렬</p>
            <ul role="radiogroup" className="gap-md flex flex-col">
              {SORT_OPTIONS.map((option) => {
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
                      className="focus-visible:ring-primary text-text-secondary hover:text-text-primary gap-2xs flex w-full items-center rounded-lg text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
                    >
                      <span
                        className={cn(
                          "flex h-4.5 w-4.5 items-center justify-center rounded-full border",
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
