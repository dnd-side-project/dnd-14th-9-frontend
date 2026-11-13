import { type ButtonHTMLAttributes } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/utils";

import { CheckIcon } from "../Icon/CheckIcon";

// 카테고리 필터 버튼 스타일 정의 (모바일 h44 / md 이상 h56)
const CATEGORY_FILTER_BUTTON_VARIANTS = cva(
  [
    "inline-flex items-center justify-center shrink-0 gap-xs",
    "bg-surface-strong",
    "text-text-muted",
    "text-sm font-semibold md:text-base",
    // 커스텀 간격 토큰(px-xl/px-2xl)은 tailwind-merge가 충돌로 보지 않으므로 padding-x md 값은 variant에서만 정한다.
    "h-11 py-sm px-lg md:h-14 md:py-md",
    "rounded-md",
    "cursor-pointer",
    "disabled:cursor-not-allowed disabled:bg-surface-disabled disabled:text-text-disabled",
    "transition-colors",
    "border-none",
  ],
  {
    variants: {
      isSelected: {
        true: "bg-surface-primary-alpha-subtler text-text-brand-default hover:bg-surface-primary-alpha-subtle active:bg-surface-primary-alpha-default md:px-2xl",
        false:
          "md:px-xl hover:bg-surface-subtle active:bg-surface-subtler active:text-text-secondary",
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
      {isSelected && <CheckIcon size="small" className="md:h-6 md:w-6" aria-hidden="true" />}
      {children}
    </button>
  );
}

export { CATEGORY_FILTER_BUTTON_VARIANTS };
