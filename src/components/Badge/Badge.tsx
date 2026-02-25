import { forwardRef, type HTMLAttributes } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { XIcon } from "@/components/Icon/XIcon";
import { cn } from "@/lib/utils/utils";

const BADGE_VARIANTS = cva(
  [
    "inline-flex",
    "items-center",
    "justify-center",
    "px-3",
    "py-1",
    "text-xs",
    "font-pretendard",
    "font-semibold",
    "border",
    "whitespace-nowrap",
  ],
  {
    variants: {
      status: {
        recruiting: [
          "bg-alpha-white-8",
          "text-text-secondary",
          "dark:text-gray-200",
          "border-alpha-white-16",
        ],
        closing: ["bg-[#FF174429]", "text-text-status-negative-default", "border-red-800"],
        inProgress: ["bg-[#27EA6729]", "text-text-brand-default", "border-[#178A42]"],
        closed: ["bg-alpha-white-16", "text-text-disabled", "border-border-subtle"],
      },
      radius: {
        max: "rounded-max",
        xs: "rounded-xs",
      },
    },
    defaultVariants: {
      status: "recruiting",
      radius: "max",
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof BADGE_VARIANTS> {
  children: React.ReactNode;
  showIcon?: boolean;
  onIconClick?: () => void;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, status, radius, showIcon = false, onIconClick, children, ...props }, ref) => {
    const canRenderIconButton = showIcon && typeof onIconClick === "function";

    return (
      <span
        ref={ref}
        className={cn(
          BADGE_VARIANTS({ status, radius }),
          canRenderIconButton && "gap-1",
          className
        )}
        {...props}
      >
        {children}
        {canRenderIconButton && (
          <button type="button" onClick={onIconClick} className="inline-flex items-center">
            <XIcon size="xsmall" />
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export { BADGE_VARIANTS };
