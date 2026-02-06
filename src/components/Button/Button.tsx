import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/utils/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md font-pretendard transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-surface-disabled disabled:text-text-disabled",
  {
    variants: {
      variant: {
        primary: "bg-surface-primary-default text-text-inverse hover:bg-surface-primary-subtle",
        secondary:
          "bg-surface-secondary-default text-text-inverse hover:bg-surface-secondary-subtle",
        tertiary: "bg-background-default text-text-secondary hover:bg-surface-subtle",
        text: "bg-transparent text-text-primary hover:bg-surface-subtler",
      },
      size: {
        xlarge: "h-16 min-w-[106px] px-xl py-md",
        large: "h-14 min-w-[94px] px-lg py-xs",
        medium: "h-12 min-w-[82px] px-md py-2xs",
        small: "h-10 min-w-[70px] px-2xs py-2xs",
        xsmall: "h-8 min-w-[58px] px-2 py-1",
      },
      iconOnly: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      { iconOnly: true, size: "xlarge", class: "min-w-0 w-16 px-0" },
      { iconOnly: true, size: "large", class: "min-w-0 w-14 px-0" },
      { iconOnly: true, size: "medium", class: "min-w-0 w-12 px-0" },
      { iconOnly: true, size: "small", class: "min-w-0 w-10 px-0" },
      { iconOnly: true, size: "xsmall", class: "min-w-0 w-8 px-0" },
    ],
    defaultVariants: {
      variant: "primary",
      size: "medium",
      iconOnly: false,
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, iconOnly, leftIcon, rightIcon, children, disabled, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, iconOnly, className }))}
        disabled={disabled}
        aria-disabled={disabled}
        {...props}
      >
        {iconOnly ? (
          (leftIcon ?? rightIcon)
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { buttonVariants };
