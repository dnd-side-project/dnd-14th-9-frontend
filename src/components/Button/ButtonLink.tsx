"use client";

import type { ComponentProps, ReactNode } from "react";

import Link from "next/link";

import { buttonVariants, type ButtonVariantProps } from "@/components/Button/Button";
import { cn } from "@/lib/utils/utils";

import type { VariantProps } from "class-variance-authority";

export type ButtonLinkProps = ComponentProps<typeof Link> &
  Omit<VariantProps<typeof buttonVariants>, "variant" | "colorScheme"> &
  ButtonVariantProps & {
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    /** true일 경우 soft navigation 대신 full page reload를 수행합니다 */
    hardNavigate?: boolean;
  };

export function ButtonLink({
  className,
  variant,
  colorScheme,
  size,
  iconOnly,
  leftIcon,
  rightIcon,
  children,
  hardNavigate,
  ...props
}: ButtonLinkProps) {
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

  if (hardNavigate) {
    const href = typeof props.href === "string" ? props.href : props.href.toString();
    return (
      <Link
        className={classNames}
        {...props}
        onClick={(e) => {
          e.preventDefault();
          window.location.href = href;
        }}
      >
        {content}
      </Link>
    );
  }

  return (
    <Link className={classNames} {...props}>
      {content}
    </Link>
  );
}
