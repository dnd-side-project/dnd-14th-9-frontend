"use client";

import { ComponentPropsWithoutRef, ReactNode } from "react";

import { ChevronDownIcon } from "@/components/Icon/ChevronDownIcon";
import { cn } from "@/lib/utils/utils";

export const menuItemBaseClassName =
  "group flex p-md items-center gap-2xs border rounded-md bg-surface-default border-border-default text-text-tertiary";

interface MenuItemProps extends ComponentPropsWithoutRef<"button"> {
  icon: ReactNode;
  label: string;
  isActive?: boolean;
}

export interface MenuItemContentProps {
  icon: ReactNode;
  label: string;
  isActive?: boolean;
}

export function MenuItemContent({ icon, label, isActive }: MenuItemContentProps) {
  return (
    <div className="gap-sm flex items-center">
      <div className="group-hover:text-text-primary relative flex shrink-0 items-center justify-center rounded-full transition-colors">
        {icon}
      </div>
      <div className="flex flex-1 flex-col items-start">
        <p
          className={cn(
            "text-[14px] font-semibold transition-colors",
            isActive ? "text-text-primary" : "text-text-tertiary group-hover:text-text-primary"
          )}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

export function MenuItem({ icon, label, isActive, className, ...props }: MenuItemProps) {
  return (
    <button
      className={cn(
        menuItemBaseClassName,
        isActive
          ? "border-border-default bg-surface-strong"
          : "border-color-default hover:border-border-default bg-transparent",
        className
      )}
      {...props}
    >
      <MenuItemContent icon={icon} label={label} isActive={isActive} />
    </button>
  );
}
