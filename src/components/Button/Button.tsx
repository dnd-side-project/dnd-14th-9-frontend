import {
  type ButtonHTMLAttributes,
  type ComponentProps,
  type MouseEventHandler,
  type ReactNode,
  type Ref,
} from "react";

import Link from "next/link";

import { cva, type VariantProps } from "class-variance-authority";

import { navigateWithHardReload } from "@/lib/navigation/hardNavigate";
import { cn } from "@/lib/utils/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md text-base font-semibold transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-surface-disabled disabled:text-text-disabled",
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
        large: "min-w-[94px] px-xl py-md",
        medium: "h-12 min-w-[82px] px-lg py-sm",
        small: "h-8 min-w-[70px] px-sm py-xs text-xs font-semibold",
        xsmall: "min-w-[58px] px-2 py-1 text-xs font-semibold",
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
      { iconOnly: true, size: "xlarge", class: "min-w-0 w-16 p-xs" },
      { iconOnly: true, size: "large", class: "min-w-0 w-14 p-xs" },
      { iconOnly: true, size: "medium", class: "min-w-0 w-12 p-xs" },
      { iconOnly: true, size: "small", class: "min-w-0 w-10 p-xs" },
      { iconOnly: true, size: "xsmall", class: "min-w-0 w-[26px] p-xs" },
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

type BaseButtonProps = Omit<VariantProps<typeof buttonVariants>, "variant" | "colorScheme"> &
  ButtonVariantProps & {
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
  };

type LinkProps = ComponentProps<typeof Link>;
type LinkOnlyProps = Omit<LinkProps, "href" | "onClick" | "ref" | "type">;

export type NativeButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "ref" | "href"> &
  BaseButtonProps & {
    href?: never;
    hardNavigate?: never;
    locale?: never;
    passHref?: never;
    prefetch?: never;
    replace?: never;
    scroll?: never;
    shallow?: never;
    ref?: Ref<HTMLButtonElement>;
  };

export type SoftNavigateButtonProps = LinkOnlyProps &
  BaseButtonProps & {
    href: LinkProps["href"];
    hardNavigate?: false;
    disabled?: never;
    type?: never;
    ref?: Ref<HTMLAnchorElement>;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
  };

export type HardNavigateButtonProps = LinkOnlyProps &
  BaseButtonProps & {
    href: string;
    hardNavigate: true;
    disabled?: never;
    type?: never;
    ref?: Ref<HTMLAnchorElement>;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
  };

export type ButtonProps = NativeButtonProps | SoftNavigateButtonProps | HardNavigateButtonProps;

export function Button({
  className,
  variant,
  colorScheme,
  size,
  iconOnly,
  leftIcon,
  rightIcon,
  children,
  ...props
}: ButtonProps) {
  const content = iconOnly ? (
    (leftIcon ?? rightIcon)
  ) : (
    <>
      {leftIcon}
      {children}
      {rightIcon}
    </>
  );

  const classNames = cn(buttonVariants({ variant, colorScheme, size, iconOnly, className }));

  if (props.href !== undefined) {
    const { href, hardNavigate, onClick, ref, ...linkProps } = props;

    if (hardNavigate === true) {
      return (
        <Link
          ref={ref}
          className={classNames}
          {...linkProps}
          href={href}
          onClick={(e) => {
            onClick?.(e);
            if (e.defaultPrevented) {
              return;
            }
            e.preventDefault();
            navigateWithHardReload(e.currentTarget.href);
          }}
        >
          {content}
        </Link>
      );
    }

    return (
      <Link ref={ref} className={classNames} {...linkProps} href={href} onClick={onClick}>
        {content}
      </Link>
    );
  }

  const { disabled, ref, ...buttonProps } = props;
  return (
    <button
      ref={ref}
      className={classNames}
      disabled={disabled}
      aria-disabled={disabled}
      {...buttonProps}
    >
      {content}
    </button>
  );
}

export { buttonVariants };
