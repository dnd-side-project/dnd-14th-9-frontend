"use client";

import { cn } from "@/lib/utils/utils";

import { Filter } from "../Filter/Filter";

import { DropdownOption } from "./DropdownOption";
import { useDropdown } from "./useDropdown";

import type { DropdownProps } from "./Dropdown.types";

export function Dropdown({
  options,
  value,
  defaultValue,
  onChange,
  placeholder = "선택",
  disabled = false,
  size = "large",
  radius = "max",
  className,
}: DropdownProps) {
  const { isOpen, selectedValue, toggle, selectOption, containerRef, listRef } = useDropdown({
    value,
    defaultValue,
    onChange,
    disabled,
  });

  const selectedLabel = options.find((opt) => opt.value === selectedValue)?.label;
  const hasSelection = selectedValue !== null;

  // size에 따른 드롭다운 너비
  const dropdownWidth = size === "small" ? "w-[74px]" : "w-[89px]";

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Filter
        size={size}
        radius={radius}
        bordered
        isOpen={isOpen}
        onClick={toggle}
        disabled={disabled}
        aria-haspopup="listbox"
        className={cn(
          hasSelection && "text-text-primary",
          isOpen && ["border-text-brand-default", "shadow-[0_0_8px_0_#27EA674D]"]
        )}
      >
        {selectedLabel || placeholder}
      </Filter>

      {isOpen && (
        <ul
          ref={listRef}
          role="listbox"
          className={cn(
            "absolute top-full left-0 z-50 mt-1",
            dropdownWidth,
            "max-h-[224px] overflow-y-auto",
            "border-border-subtle rounded-sm border",
            "bg-surface-strong p-xs",
            "scrollbar-hide"
          )}
        >
          {options.map((option) => (
            <DropdownOption
              key={option.value}
              option={option}
              isSelected={option.value === selectedValue}
              onSelect={selectOption}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
