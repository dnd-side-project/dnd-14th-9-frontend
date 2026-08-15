import { type InputHTMLAttributes } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { SearchIcon } from "@/components/Icon/SearchIcon";
import { cn } from "@/lib/utils/utils";

const searchInputContainerVariants = cva(
  [
    "group",
    "flex",
    "items-center",
    "w-full",
    "border",
    "border-border-gray-default",
    "rounded-md",
    "bg-surface-strong",
    "transition-all",
    "duration-300",
    "has-[input:not(:placeholder-shown)]:border-border-gray-strong",
    "has-[input:not(:placeholder-shown)]:bg-surface-default",
    "focus-within:!border-text-brand-default",
    "focus-within:!bg-surface-default",
    "focus-within:!shadow-[0_0_16px_0_rgba(39,234,103,0.30)]",
  ].join(" "),
  {
    variants: {
      size: {
        responsive:
          "h-11 pl-lg pr-xs py-3xs gap-xs md:h-14 md:max-w-[580px] md:pl-xl md:pr-sm md:py-xs",
        md: "h-14 max-w-[580px] pl-xl pr-sm py-xs gap-xs",
        sm: "h-11 max-w-[375px] pl-lg pr-xs py-3xs gap-xs",
      },
    },
    defaultVariants: {
      size: "responsive",
    },
  }
);

const searchInputVariants = cva(
  [
    "flex-1",
    "h-full",
    "bg-transparent",
    "text-gray-50",
    "font-semibold",
    "placeholder:text-gray-400",
    "focus:outline-none",
    "min-w-0",
  ].join(" "),
  {
    variants: {
      size: {
        responsive: "text-[13px] leading-[1.4] md:text-base",
        md: "text-base",
        sm: "text-[13px] leading-[1.4]",
      },
    },
    defaultVariants: {
      size: "responsive",
    },
  }
);

export interface SearchInputProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size">,
    VariantProps<typeof searchInputContainerVariants> {
  onSearchClick?: () => void;
  ref?: React.Ref<HTMLInputElement>;
}

export function SearchInput({
  className,
  size = "responsive",
  onSearchClick,
  ref,
  ...props
}: SearchInputProps) {
  const iconSize = size === "sm" ? "small" : size === "md" ? "medium" : "small";

  return (
    <div className={cn(searchInputContainerVariants({ size }), className)}>
      <input
        ref={ref}
        type="text"
        className={searchInputVariants({ size })}
        placeholder={props.placeholder ?? " "}
        {...props}
      />
      <button
        type="button"
        onClick={onSearchClick}
        aria-label="검색"
        className="p-xs flex shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-gray-800"
      >
        <SearchIcon
          size={iconSize}
          className={cn(
            "group-focus-within:text-text-primary text-gray-300 transition-colors",
            size === "responsive" && "md:h-6 md:w-6"
          )}
        />
      </button>
    </div>
  );
}

export { searchInputContainerVariants, searchInputVariants };
