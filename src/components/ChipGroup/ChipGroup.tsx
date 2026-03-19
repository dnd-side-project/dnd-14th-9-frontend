import { type HTMLAttributes } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/utils";

const CHIPGROUP_VARIANTS = cva(["inline-flex", "flex-row", "flex-wrap", "items-center", "gap-2"]);

export interface ChipGroupProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof CHIPGROUP_VARIANTS> {
  children: React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
}

export function ChipGroup({ className, children, ref, ...props }: ChipGroupProps) {
  return (
    <div ref={ref} className={cn(CHIPGROUP_VARIANTS({ className }))} role="group" {...props}>
      {children}
    </div>
  );
}

export { CHIPGROUP_VARIANTS };
