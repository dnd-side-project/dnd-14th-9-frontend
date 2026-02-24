"use client";

import type { ComponentProps, ReactNode } from "react";

import Link from "next/link";

import { buttonVariants, type ButtonVariantProps } from "@/components/Button/Button";
import { navigateWithHardReload } from "@/lib/navigation/hardNavigate";
import { cn } from "@/lib/utils/utils";

import type { VariantProps } from "class-variance-authority";

type LinkProps = ComponentProps<typeof Link>;

type ButtonLinkStyleProps = Omit<VariantProps<typeof buttonVariants>, "variant" | "colorScheme"> &
  ButtonVariantProps & {
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
  };

type BaseButtonLinkProps = Omit<LinkProps, "href" | "onClick"> & ButtonLinkStyleProps;

type SoftNavigateButtonLinkProps = BaseButtonLinkProps & {
  href: LinkProps["href"];
  onClick?: LinkProps["onClick"];
  hardNavigate?: false;
};

type HardNavigateButtonLinkProps = BaseButtonLinkProps & {
  href: string;
  onClick?: LinkProps["onClick"];
  /** true일 경우 soft navigation 대신 full page reload를 수행합니다 */
  hardNavigate: true;
};

export type ButtonLinkProps = SoftNavigateButtonLinkProps | HardNavigateButtonLinkProps;

export function ButtonLink(props: ButtonLinkProps) {
  const {
    className,
    variant,
    colorScheme,
    size,
    iconOnly,
    leftIcon,
    rightIcon,
    children,
    hardNavigate,
    href,
    onClick,
    ...linkProps
  } = props;

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
    return (
      <Link
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
    <Link className={cn(classNames)} {...linkProps} href={href} onClick={onClick}>
      {content}
    </Link>
  );
}
