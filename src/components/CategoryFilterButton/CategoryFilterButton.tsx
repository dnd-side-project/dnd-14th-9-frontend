import { type ButtonHTMLAttributes } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/utils";

// 카테고리 필터 버튼 스타일 정의
const CATEGORY_FILTER_BUTTON_VARIANTS = cva(
  [
    "inline-flex items-center justify-center shrink-0",
    "bg-surface-strong",
    "text-text-muted",
    "text-xs font-semibold",
    "py-sm px-md",
    "rounded-sm",
    "cursor-pointer",
    "transition-colors",
    "border-none",
  ],
  {
    variants: {
      isSelected: {
        true: "bg-[#52EE8533] text-green-600 gap-2xs",
        false:
          "hover:bg-surface-subtle hover:text-text-primary active:bg-surface-subtle active:text-text-primary gap-xs",
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
    ref?: React.Ref<HTMLButtonElement>;
  };

export function CategoryFilterButton({
  className,
  isSelected = false,
  children,
  ref,
  ...props
}: CategoryFilterButtonProps) {
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

export { CATEGORY_FILTER_BUTTON_VARIANTS };
