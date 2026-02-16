import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/utils";

import { ChevronDownIcon } from "../Icon/ChevronDownIcon";

const FILTER_VARIANTS = cva(
  [
    "inline-flex",
    "cursor-pointer",
    "items-center",
    "justify-between",
    "font-pretendard",
    "font-semibold",
    "text-gray-200",
    "bg-surface-strong",
    "transition-all",
    "focus-visible:outline-none",
  ],
  {
    variants: {
      size: {
        full: ["w-full", "h-14", "text-[16px]", "px-xs"],
        large: ["w-[89px]", "h-10", "text-[16px]", "py-xs", "pr-xs", "pl-sm"],
        small: ["w-[74px]", "h-7", "text-xs", "py-xs", "pr-xs", "pl-sm"],
      },
      radius: {
        max: "rounded-max",
        sm: "rounded-sm",
      },
      bordered: {
        true: "border border-border-default",
        false: "",
      },
    },
    defaultVariants: {
      size: "large",
      radius: "max",
      bordered: true,
    },
  }
);

export interface FilterProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof FILTER_VARIANTS> {
  isOpen?: boolean;
}

export const Filter = forwardRef<HTMLButtonElement, FilterProps>(
  ({ className, size, radius, bordered, isOpen = false, children, ...props }, ref) => {
    const iconSize = size === "small" ? "small" : "medium";

    return (
      <button
        ref={ref}
        type="button"
        className={cn(FILTER_VARIANTS({ size, radius, bordered, className }))}
        aria-expanded={isOpen}
        {...props}
      >
        <span className="truncate">{children}</span>
        <ChevronDownIcon
          size={iconSize}
          className={cn("shrink-0 transition-transform duration-200", isOpen && "rotate-180")}
        />
      </button>
    );
  }
);

Filter.displayName = "Filter";

export { FILTER_VARIANTS };
