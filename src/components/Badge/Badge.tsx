import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@/lib/utils/utils";

const badgeVariants = cva(
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
        recruiting: ["bg-alpha-white-8", "text-text-secondary", "border-alpha-white-16"],
        closing: [
          "bg-[#FF174429]",
          "text-text-status-negative-default",
          "border-border-error-subtler",
        ],
        inProgress: ["bg-gray-700", "text-text-brand-default", "border-border-primary-subtler"],
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
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, status, radius, children, ...props }, ref) => {
    return (
      <span ref={ref} className={cn(badgeVariants({ status, radius, className }))} {...props}>
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export { badgeVariants };
