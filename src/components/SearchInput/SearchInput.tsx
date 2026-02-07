import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type InputHTMLAttributes } from "react";

import { SearchIcon } from "@/components/Icon/SearchIcon";
import { cn } from "@/lib/utils/utils";

const searchInputVariants = cva(
  [
    "w-full",
    "max-w-[580px]",
    "h-14",
    "px-sm",
    "pr-10",
    "border",
    "border-border-gray-default",
    "rounded-sm",
    "bg-transparent",
    "text-gray-50",
    "text-base",
    "font-weight-semibold",
    "font-pretendard",
    "placeholder:text-gray-300",
    "transition-colors",
    "focus:outline-none",
    "focus:border-border-strong",
  ].join(" ")
);

export interface SearchInputProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, "type">,
    VariantProps<typeof searchInputVariants> {}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative w-full max-w-145">
        <input
          ref={ref}
          type="search"
          className={cn(searchInputVariants(), className)}
          {...props}
        />
        <SearchIcon
          size="small"
          className="right-xs pointer-events-none absolute top-1/2 -translate-y-1/2 text-gray-300"
        />
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export { searchInputVariants };
