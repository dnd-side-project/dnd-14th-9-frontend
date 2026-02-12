import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md font-pretendard transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-surface-disabled disabled:text-text-disabled",
  {
    variants: {
      variant: {
        solid: "",
        outlined: "bg-transparent border",
        ghost: "bg-transparent",
      },
      colorScheme: {
        primary: "",
        secondary: "",
        tertiary: "",
      },
      size: {
        xlarge: "h-16 min-w-[106px] px-xl py-md",
        large: "h-14 min-w-[94px] px-lg py-xs",
        medium: "h-12 min-w-[82px] px-md py-2xs",
        small: "h-8 min-w-[70px] px-sm py-xs text-xs font-semibold",
        xsmall: "h-8 min-w-[58px] px-2 py-1",
      },
      iconOnly: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      // SOLID
      {
        variant: "solid",
        colorScheme: "primary",
        class:
          "bg-surface-primary-default text-text-inverse hover:bg-surface-primary-subtle active:bg-green-700",
      },
      {
        variant: "solid",
        colorScheme: "secondary",
        class: "bg-[#27EA6714] text-text-brand-default hover:bg-[#27EA6729] active:bg-[#27EA673D]",
      },
      {
        variant: "solid",
        colorScheme: "tertiary",
        class:
          "bg-surface-strong text-text-muted hover:bg-surface-subtle active:bg-surface-subtler active:text-text-secondary",
      },
      // OUTLINED
      {
        variant: "outlined",
        colorScheme: "primary",
        class:
          "border-green-800 text-text-brand-subtle hover:border-border-primary-default hover:text-text-brand-default",
      },
      {
        variant: "outlined",
        colorScheme: "secondary",
        class:
          "border-border-default text-text-tertiary hover:text-text-secondary active:border-border-strong active:text-text-primary",
      },
      // GHOST
      {
        variant: "ghost",
        colorScheme: "primary",
        class:
          "text-surface-primary-default hover:text-surface-primary-subtle active:text-green-700",
      },
      {
        variant: "ghost",
        colorScheme: "secondary",
        class: "text-text-muted hover:text-text-secondary active:text-text-primary",
      },
      // iconOnly
      { iconOnly: true, size: "xlarge", class: "min-w-0 w-16 px-0" },
      { iconOnly: true, size: "large", class: "min-w-0 w-14 px-0" },
      { iconOnly: true, size: "medium", class: "min-w-0 w-12 px-0" },
      { iconOnly: true, size: "small", class: "min-w-0 w-10 px-0" },
      { iconOnly: true, size: "xsmall", class: "min-w-0 w-8 px-0" },
    ],
    defaultVariants: {
      variant: "solid",
      colorScheme: "primary",
      size: "medium",
      iconOnly: false,
    },
  }
);

type SolidButtonProps = {
  variant?: "solid";
  colorScheme?: "primary" | "secondary" | "tertiary";
};

type OutlinedButtonProps = {
  variant: "outlined";
  colorScheme?: "primary" | "secondary";
};

type GhostButtonProps = {
  variant: "ghost";
  colorScheme?: "primary" | "secondary";
};

export type ButtonVariantProps = SolidButtonProps | OutlinedButtonProps | GhostButtonProps;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  Omit<VariantProps<typeof buttonVariants>, "variant" | "colorScheme"> &
  ButtonVariantProps & {
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      colorScheme,
      size,
      iconOnly,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, colorScheme, size, iconOnly, className }))}
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
