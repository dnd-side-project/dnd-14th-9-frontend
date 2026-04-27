import { type HTMLAttributes } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { XIcon } from "@/components/Icon/XIcon";
import { cn } from "@/lib/utils/utils";

const CHIP_BADGE_VARIANTS = cva(
  [
    "inline-flex",
    "items-center",
    "justify-center",
    "py-1",
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
        closing: ["bg-[#FF174429]", "text-text-status-negative-default", "border-[#66091b]"],
        inProgress: ["bg-[#27EA6729]", "text-text-brand-default", "border-[#178A42]"],
        closed: ["bg-alpha-white-16", "text-text-disabled", "border-border-subtle"],
      },
      radius: {
        max: "rounded-max",
        xs: "rounded-xs",
      },
      size: {
        md: ["px-3", "text-xs"],
        sm: ["px-2", "text-[10px]"],
      },
    },
    compoundVariants: [
      {
        radius: "xs",
        size: "md",
        class: "px-2",
      },
      {
        radius: "xs",
        size: "sm",
        class: "px-2",
      },
    ],
    defaultVariants: {
      status: "recruiting",
      radius: "max",
      size: "md",
    },
  }
);

export interface ChipBadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof CHIP_BADGE_VARIANTS> {
  children: React.ReactNode;
  showIcon?: boolean;
  onIconClick?: () => void;
  ref?: React.Ref<HTMLSpanElement>;
}

export function ChipBadge({
  className,
  status,
  radius,
  size,
  showIcon = false,
  onIconClick,
  children,
  ref,
  ...props
}: ChipBadgeProps) {
  const canRenderIconButton = showIcon && typeof onIconClick === "function";

  return (
    <span
      ref={ref}
      className={cn(
        CHIP_BADGE_VARIANTS({ status, radius, size }),
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

export { CHIP_BADGE_VARIANTS };
