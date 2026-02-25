"use client";

import { useCallback, useRef } from "react";

import { Filter } from "@/components/Filter/Filter";
import { CheckIcon } from "@/components/Icon/CheckIcon";
import { useClickOutside } from "@/hooks/useClickOutside";
import { cn } from "@/lib/utils/utils";

import { TIME_SLOT_OPTIONS } from "./sessionListFilter.types";
import { getTimeSlotFilterLabel } from "./sessionListFilter.utils";

import type { TimeSlot } from "../../types";

interface StartTimeFilterProps {
  isOpen: boolean;
  selectedTimeSlots: TimeSlot[];
  onOpenChange: (isOpen: boolean) => void;
  onToggleTimeSlot: (timeSlot: TimeSlot) => void;
}

export function StartTimeFilter({
  isOpen,
  selectedTimeSlots,
  onOpenChange,
  onToggleTimeSlot,
}: StartTimeFilterProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const closeFilter = useCallback(() => onOpenChange(false), [onOpenChange]);
  useClickOutside(containerRef, closeFilter, isOpen);

  const hasTimeSlotSelection = selectedTimeSlots.length > 0;
  const timeSlotLabel = getTimeSlotFilterLabel(selectedTimeSlots);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <Filter
        size="large"
        radius="sm"
        isOpen={isOpen}
        aria-haspopup="dialog"
        onClick={() => onOpenChange(!isOpen)}
        className={cn(
          "hover:text-text-primary w-auto shrink-0",
          hasTimeSlotSelection && "text-text-primary bg-surface-strong"
        )}
      >
        {timeSlotLabel}
      </Filter>

      {isOpen && (
        <div
          role="dialog"
          aria-label="시작 시간대 선택"
          className="px-xl py-lg border-border-subtle bg-surface-default absolute top-full left-0 z-20 mt-3 w-[256px] rounded-sm border shadow-[0px_0px_2px_0px_#00000014,0px_16px_24px_0px_#0000001F]"
        >
          <ul className="gap-md flex flex-col">
            {TIME_SLOT_OPTIONS.map((option) => {
              const isSelected = selectedTimeSlots.includes(option.value);

              return (
                <li key={option.value} className="w-full">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={isSelected}
                    onClick={() => onToggleTimeSlot(option.value)}
                    className="focus-visible:ring-primary text-text-secondary hover:text-text-primary gap-xs flex w-full cursor-pointer items-center rounded-[4px] text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-[4px] border border-solid",
                        isSelected
                          ? "border-border-primary-default bg-surface-primary-alpha-subtle text-text-brand-default"
                          : "border-border-strong bg-transparent text-transparent"
                      )}
                    >
                      <CheckIcon size="xsmall" />
                    </span>
                    <span className="text-[15px] leading-[1.4]">{option.panelLabel}</span>
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
