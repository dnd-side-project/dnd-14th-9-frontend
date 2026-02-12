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
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(buttonVariants({ variant, colorScheme, size, iconOnly, className }))}
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
    </Link>
  );
}
