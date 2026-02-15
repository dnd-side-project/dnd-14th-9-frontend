"use client";

import { CheckIcon } from "@/components/Icon/CheckIcon";
import { cn } from "@/lib/utils/utils";

import type { DropdownOptionProps } from "./Dropdown.types";

export function DropdownOption({ option, isSelected, onSelect }: DropdownOptionProps) {
  const handleClick = () => {
    if (option.disabled) return;
    onSelect(option.value);
  };

  return (
    <li
      role="option"
      aria-selected={isSelected}
      aria-disabled={option.disabled}
      onClick={handleClick}
      className={cn(
        "p-xs flex cursor-pointer items-center justify-between text-[16px] transition-colors",
        isSelected ? "text-text-primary" : "text-text-muted",
        !isSelected && "hover:text-text-primary",
        option.disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <span>{option.label}</span>
      {isSelected && <CheckIcon size="xsmall" />}
    </li>
  );
}
