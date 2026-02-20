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
    VariantProps<typeof searchInputContainerVariants> {}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className={cn(searchInputContainerVariants(), className)}>
        <input ref={ref} type="search" className={searchInputVariants()} {...props} />
        <div className="p-xs flex shrink-0 items-center justify-center rounded-md">
          <SearchIcon size="small" className="mr-sm pointer-events-none text-gray-300" />
        </div>
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export { searchInputContainerVariants, searchInputVariants };
