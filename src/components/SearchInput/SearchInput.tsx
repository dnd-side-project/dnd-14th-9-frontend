import { forwardRef, type InputHTMLAttributes } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { SearchIcon } from "@/components/Icon/SearchIcon";
import { cn } from "@/lib/utils/utils";

const searchInputContainerVariants = cva(
  [
    "group",
    "flex",
    "items-center",
    "w-full",
    "max-w-[580px]",
    "h-14",
    "pl-lg",
    "pr-sm",
    "py-xs",
    "gap-xs",
    "border",
    "border-border-gray-default",
    "rounded-md",
    "bg-surface-strong",
    "transition-all",
    "duration-300",
    "has-[:not(:placeholder-shown)]:border-border-gray-strong",
    "has-[:not(:placeholder-shown)]:bg-surface-default",
    "focus-within:!border-text-brand-default",
    "focus-within:!bg-surface-default",
    "focus-within:!shadow-[0_0_16px_0_rgba(39,234,103,0.30)]",
  ].join(" ")
);

const searchInputVariants = cva(
  [
    "flex-1",
    "h-full",
    "bg-transparent",
    "text-gray-50",
    "text-base",
    "font-weight-semibold",
    "placeholder:text-gray-300",
    "focus:outline-none",
    "min-w-0",
  ].join(" ")
);

export interface SearchInputProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, "type">,
    VariantProps<typeof searchInputContainerVariants> {
  onSearchClick?: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onSearchClick, ...props }, ref) => {
    return (
      <div className={cn(searchInputContainerVariants(), className)}>
        <input
          ref={ref}
          type="text"
          className={searchInputVariants()}
          placeholder={props.placeholder ?? " "}
          {...props}
        />
        <button
          type="button"
          onClick={onSearchClick}
          className="p-xs flex shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-gray-800"
        >
          <SearchIcon
            size="small"
            className="group-focus-within:text-text-primary text-gray-300 transition-colors"
          />
        </button>
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export { searchInputContainerVariants, searchInputVariants };
