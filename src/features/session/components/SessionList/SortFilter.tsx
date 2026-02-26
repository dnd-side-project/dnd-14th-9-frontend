"use client";

import { useCallback, useRef } from "react";

import { Filter } from "@/components/Filter/Filter";
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
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closeFilter = useCallback(() => {
    onOpenChange(false);
    triggerRef.current?.focus();
  }, [onOpenChange]);
  useClickOutside(containerRef, closeFilter, isOpen);

  const triggerLabel = getOptionLabel(SORT_OPTIONS, value, "정렬");

  return (
    <div ref={containerRef} className={cn("relative shrink-0", className)}>
      <Filter
        ref={triggerRef}
        size="medium"
        radius="sm"
        bordered={false}
        isOpen={isOpen}
        aria-haspopup="dialog"
        onClick={() => onOpenChange(!isOpen)}
        className={cn("min-w-20", isOpen && "border-transparent! bg-transparent!")}
      >
        {triggerLabel}
      </Filter>

      {isOpen && (
        <div
          role="dialog"
          aria-label="정렬 선택"
          className="p-sm border-border-subtle bg-surface-default absolute top-full right-0 z-20 mt-2 rounded-md border shadow-[0px_0px_2px_0px_#00000014,0px_16px_24px_0px_#0000001F]"
        >
          <ul role="radiogroup" className="gap-2xs flex flex-col">
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
                    className={cn(
                      "px-md py-2xs hover:bg-surface-strong hover:text-text-primary flex w-full cursor-pointer items-center justify-center rounded-xs text-[13px] leading-[1.4] transition-colors focus-visible:outline-none",
                      isSelected
                        ? "text-text-primary font-semibold"
                        : "text-text-secondary font-regular"
                    )}
                  >
                    <span className="whitespace-nowrap">{option.label}</span>
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
