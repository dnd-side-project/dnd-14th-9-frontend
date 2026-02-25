import type { ReactNode } from "react";

import { ButtonLink } from "@/components/Button/ButtonLink";
import { cn } from "@/lib/utils/utils";

export interface MenuLinkProps {
  href: string;
  icon: ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export function MenuLink({ href, icon, label, isActive, onClick }: MenuLinkProps) {
  return (
    <ButtonLink
      href={href}
      onClick={onClick}
      variant="ghost"
      colorScheme="secondary"
      className={cn(
        "border-border-default bg-surface-default text-text-tertiary group flex items-center rounded-md border",
        "border-color-default hover:border-border-default pr-md pl-lg py-md justify-start",
        isActive && "bg-surface-strong",
        "active:bg-surface-strong"
      )}
    >
      <div className="gap-sm flex items-center">
        <div className="group-hover:text-text-primary relative flex shrink-0 items-center justify-center rounded-full transition-colors">
          {icon}
        </div>
        <p
          className={cn(
            "text-[14px] font-semibold transition-colors",
            isActive ? "text-text-primary" : "text-text-tertiary group-hover:text-text-primary"
          )}
        >
          {label}
        </p>
      </div>
    </ButtonLink>
  );
}
