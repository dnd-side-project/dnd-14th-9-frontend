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
    "transition-colors",
    "focus-visible:outline-none",
  ],
  {
    variants: {
      size: {
        full: ["w-full", "h-14", "text-base", "px-xs"],
        large: ["w-[89px]", "h-10", "text-sm", "py-xs", "pr-xs", "pl-md"],
        medium: ["w-[74px]", "h-7", "text-xs", "py-2xs", "pr-2xs", "pl-xs"],
      },
      radius: {
        max: "rounded-max",
        sm: "rounded-sm",
        none: "rounded-none",
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
    const iconSize = size === "medium" ? "small" : "medium";

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          FILTER_VARIANTS({ size, radius, bordered }),
          isOpen
            ? "bg-surface-strong border-border-default text-text-primary"
            : "bg-surface-default",
          className
        )}
        aria-expanded={isOpen}
        {...props}
      >
        <div className="gap-xs flex items-center">
          <span className="truncate">{children}</span>
          <ChevronDownIcon
            size={iconSize}
            className={cn("shrink-0 transition-transform duration-200", isOpen && "rotate-180")}
          />
        </div>
      </button>
    );
  }
);

Filter.displayName = "Filter";

export { FILTER_VARIANTS };
