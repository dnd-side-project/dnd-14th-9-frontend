"use client";

import { ComponentPropsWithoutRef, ReactNode } from "react";

import { ChevronDownIcon } from "@/components/Icon/ChevronDownIcon";
import { cn } from "@/lib/utils/utils";

export const menuItemBaseClassName =
  "group flex h-[55px] w-full cursor-pointer items-center gap-1 rounded-md border p-4 transition-all duration-200";

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
    <div className="flex flex-1 items-center gap-4">
      <div className="bg-alpha-black-24 group-hover:text-text-primary relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors">
        {icon}
      </div>
      <div className="flex flex-1 flex-col items-start">
        <p
          className={cn(
            "font-pretendard text-base font-semibold transition-colors",
            isActive ? "text-text-primary" : "group-hover:text-text-primary text-gray-500"
          )}
        >
          {label}
        </p>
      </div>
      <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center">
        <ChevronDownIcon className="group-hover:text-text-primary h-[18px] w-[18px] -rotate-90 text-gray-500 transition-colors" />
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
          ? "border-border-default bg-surface-subtle"
          : "border-color-default hover:border-border-default hover:bg-surface-subtle bg-transparent",
        className
      )}
      {...props}
    >
      <MenuItemContent icon={icon} label={label} isActive={isActive} />
    </button>
  );
}
