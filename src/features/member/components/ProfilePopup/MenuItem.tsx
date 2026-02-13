"use client";

import { ComponentPropsWithoutRef, ReactNode } from "react";

import { ChevronDownIcon } from "@/components/Icon/ChevronDownIcon";
import { cn } from "@/lib/utils/utils";

interface MenuItemProps extends ComponentPropsWithoutRef<"button"> {
  icon: ReactNode;
  label: string;
  isActive?: boolean;
}

export function MenuItem({ icon, label, isActive, className, ...props }: MenuItemProps) {
  return (
    <button
      className={cn(
        "group flex h-[55px] w-full cursor-pointer items-center gap-1 rounded-md border-[2px] p-4 transition-all duration-200",
        isActive
          ? "border-green-500 bg-gray-800"
          : "border-transparent bg-gray-800 hover:border-green-500 hover:bg-gray-800",
        className
      )}
      {...props}
    >
      <div className="flex flex-1 items-center gap-4">
        <div className="bg-alpha-black-24 relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors group-hover:text-green-600">
          {icon}
        </div>
        <div className="flex flex-1 flex-col items-start">
          <p
            className={cn(
              "font-pretendard text-base font-semibold transition-colors",
              isActive ? "text-green-600" : "text-gray-500 group-hover:text-green-600"
            )}
          >
            {label}
          </p>
        </div>
        <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center">
          <ChevronDownIcon className="h-[18px] w-[18px] -rotate-90 text-gray-500 transition-colors group-hover:text-green-600" />
        </div>
      </div>
    </button>
  );
}
