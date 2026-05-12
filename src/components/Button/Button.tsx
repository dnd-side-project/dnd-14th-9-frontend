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
  "inline-flex cursor-pointer items-center justify-center gap-xs whitespace-nowrap font-semibold leading-[1.4] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary-default disabled:cursor-not-allowed disabled:text-text-disabled",
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
        xlarge: "h-16 min-w-[106px] rounded-md px-2xl py-lg text-base",
        large: "h-14 min-w-[90px] rounded-md px-xl py-md text-base",
        medium: "h-11 min-w-[77px] rounded-md px-lg py-sm text-sm",
        small: "h-8 min-w-14 rounded-sm px-sm py-xs text-xs",
        xsmall: "h-[26px] min-w-12 rounded-xs px-xs py-2xs text-xs",
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
          "bg-surface-primary-default text-text-inverse hover:bg-surface-primary-subtle active:bg-surface-primary-strong disabled:bg-surface-disabled",
      },
      {
        variant: "solid",
        colorScheme: "secondary",
        class:
          "bg-surface-primary-alpha-subtler text-text-brand-default hover:bg-surface-primary-alpha-subtle active:bg-surface-primary-alpha-default disabled:bg-surface-disabled",
      },
      {
        variant: "solid",
        colorScheme: "tertiary",
        class:
          "bg-surface-strong text-text-muted hover:bg-surface-subtle active:bg-surface-subtler active:text-text-secondary disabled:bg-surface-disabled",
      },
      // OUTLINED
      {
        variant: "outlined",
        colorScheme: "primary",
        class:
          "border-border-primary-subtler text-text-brand-subtle hover:text-text-brand-subtler active:border-border-primary-default active:text-text-brand-default disabled:border-border-disabled disabled:bg-surface-disabled",
      },
      {
        variant: "outlined",
        colorScheme: "secondary",
        class:
          "border-border-default text-text-tertiary hover:text-text-secondary active:border-border-strong active:text-text-primary disabled:border-border-disabled disabled:bg-surface-disabled",
      },
      // GHOST
      {
        variant: "ghost",
        colorScheme: "primary",
        class:
          "text-text-brand-default hover:text-text-brand-subtler active:text-text-brand-subtle",
      },
      {
        variant: "ghost",
        colorScheme: "secondary",
        class: "text-text-tertiary hover:text-text-secondary active:text-text-primary",
      },
      // iconOnly
      { iconOnly: true, size: "xlarge", class: "size-16 min-w-0 p-lg" },
      { iconOnly: true, size: "large", class: "size-14 min-w-0 p-md" },
      { iconOnly: true, size: "medium", class: "size-11 min-w-0 p-sm" },
      { iconOnly: true, size: "small", class: "size-8 min-w-0 p-xs" },
      { iconOnly: true, size: "xsmall", class: "size-[26px] min-w-0 p-2xs" },
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
            if (!e.defaultPrevented) {
              e.preventDefault();
              navigateWithHardReload(e.currentTarget.href);
            }
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
