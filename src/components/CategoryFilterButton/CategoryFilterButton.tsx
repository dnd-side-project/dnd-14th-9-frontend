import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/utils";

// 카테고리 필터 버튼 스타일 정의
const CATEGORY_FILTER_BUTTON_VARIANTS = cva(
  [
    "inline-flex items-center justify-center",
    "bg-surface-strong",
    "text-text-muted",
    "text-sm font-semibold",
    "py-sm px-md",
    "rounded-sm",
    "cursor-pointer",
    "transition-colors",
    "border-none",
  ],
  {
    variants: {
      isSelected: {
        true: "bg-[#52EE8533] text-green-600",
        false:
          "hover:bg-[#52EE8533] hover:text-green-600 active:bg-[#52EE8533] active:text-green-600",
      },
    },
    defaultVariants: {
      isSelected: false,
    },
  }
);

export type CategoryFilterButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  Omit<VariantProps<typeof CATEGORY_FILTER_BUTTON_VARIANTS>, "isSelected"> & {
    isSelected?: boolean;
  };

export const CategoryFilterButton = forwardRef<HTMLButtonElement, CategoryFilterButtonProps>(
  ({ className, isSelected = false, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(CATEGORY_FILTER_BUTTON_VARIANTS({ isSelected, className }))}
        aria-pressed={isSelected}
        {...props}
      >
        {children}
      </button>
    );
  }
);

CategoryFilterButton.displayName = "CategoryFilterButton";

export { CATEGORY_FILTER_BUTTON_VARIANTS };
