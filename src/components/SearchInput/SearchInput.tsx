import { forwardRef, type InputHTMLAttributes } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { SearchIcon } from "@/components/Icon/SearchIcon";
import { cn } from "@/lib/utils/utils";

const searchInputContainerVariants = cva(
  [
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
    "border-border-gray-subtler",
    "rounded-sm",
    "bg-gray-950",
    "transition-colors",
    "focus-within:border-text-brand-default",
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
    "font-pretendard",
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
        <input ref={ref} type="text" className={searchInputVariants()} {...props} />
        <button
          type="button"
          onClick={onSearchClick}
          className="p-xs flex shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-gray-800"
        >
          <SearchIcon size="small" className="text-gray-300" />
        </button>
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export { searchInputContainerVariants, searchInputVariants };
