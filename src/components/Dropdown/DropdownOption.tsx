"use client";

import { CheckIcon } from "@/components/Icon/CheckIcon";
import { cn } from "@/lib/utils/utils";

import type { DropdownOptionProps } from "./Dropdown.types";

const SIZE_STYLES = {
  full: { text: "text-[16px]", container: "px-xs h-14", showIcon: true },
  large: { text: "text-sm", container: "px-sm h-10", showIcon: false },
  small: { text: "text-xs", container: "px-sm h-7", showIcon: false },
} as const;

export function DropdownOption({
  option,
  isSelected,
  onSelect,
  size = "full",
}: DropdownOptionProps) {
  const handleClick = () => {
    if (option.disabled) return;
    onSelect(option.value);
  };

  const styles = SIZE_STYLES[size];

  return (
    <li
      role="option"
      aria-selected={isSelected}
      aria-disabled={option.disabled}
      onClick={handleClick}
      className={cn(
        "border-border-subtle bg-surface-default cursor-pointer border-b leading-none transition-colors last:border-b-0",
        styles.text,
        isSelected ? "text-text-primary" : "text-text-muted",
        !isSelected && "hover:text-text-primary",
        option.disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <div className={cn("flex items-center justify-between", styles.container)}>
        <span className="leading-none">{option.label}</span>
        {isSelected && styles.showIcon && <CheckIcon size="medium" className="shrink-0" />}
      </div>
    </li>
  );
}
