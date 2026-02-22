"use client";

import { useCallback, useRef } from "react";

import { DatePicker } from "@/components/DatePicker/DatePicker";
import type { DateRange } from "@/components/DatePicker/DatePicker.types";
import { Filter } from "@/components/Filter/Filter";
import { useClickOutside } from "@/hooks/useClickOutside";
import { cn } from "@/lib/utils/utils";

interface DateRangeFilterProps {
  isOpen: boolean;
  label: string;
  value: DateRange;
  hasSelection: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onChange: (range: DateRange) => void;
}

export function DateRangeFilter({
  isOpen,
  label,
  value,
  hasSelection,
  onOpenChange,
  onChange,
}: DateRangeFilterProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const closeFilter = useCallback(() => onOpenChange(false), [onOpenChange]);
  useClickOutside(containerRef, closeFilter, isOpen);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <Filter
        size="large"
        radius="sm"
        isOpen={isOpen}
        onClick={() => onOpenChange(!isOpen)}
        className={cn("w-auto max-w-[280px] shrink-0", hasSelection && "text-text-primary")}
      >
        {label}
      </Filter>

      {isOpen && (
        <div className="absolute top-full left-0 z-20 mt-3">
          <DatePicker
            mode="range"
            value={value}
            onChange={onChange}
            className="bg-surface-default"
          />
        </div>
      )}
    </div>
  );
}
