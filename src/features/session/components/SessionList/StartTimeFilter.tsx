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
          "w-auto shrink-0",
          hasTimeSlotSelection && "text-text-primary",
          isOpen && ["border-text-brand-default", "shadow-[0_0_8px_0_#27EA674D]"]
        )}
      >
        {timeSlotLabel}
      </Filter>

      {isOpen && (
        <div
          role="dialog"
          aria-label="시작 시간대 선택"
          className="p-xl absolute top-full left-0 z-20 mt-3 w-[256px] rounded-sm border border-gray-900 bg-gray-950"
        >
          <div className="flex flex-col gap-[20px]">
            <p className="text-[16px] leading-[1.4] font-semibold text-gray-300">시작 시간대</p>
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
                      className="focus-visible:ring-primary text-text-secondary hover:text-text-primary gap-2xs flex w-full items-center rounded-[4px] text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
                    >
                      <span
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-[4px] border",
                          isSelected
                            ? "border-[#007E4E] bg-[#003A23] text-[#27EA67]"
                            : "border-gray-600 bg-transparent text-transparent"
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
        </div>
      )}
    </div>
  );
}
