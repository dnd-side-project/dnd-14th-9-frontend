import { cva, type VariantProps } from "class-variance-authority";
import { Children, forwardRef, type HTMLAttributes } from "react";

import { cn } from "@/lib/utils/utils";

const CHIPGROUP_VARIANTS = cva(["inline-flex", "flex-row", "flex-wrap", "items-center", "gap-2"]);

export interface ChipGroupProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof CHIPGROUP_VARIANTS> {
  children: React.ReactNode;
}

export const ChipGroup = forwardRef<HTMLDivElement, ChipGroupProps>(
  ({ className, children, ...props }, ref) => {
    const chips = Children.toArray(children).slice(0, 4);

    return (
      <div ref={ref} className={cn(CHIPGROUP_VARIANTS({ className }))} role="group" {...props}>
        {chips}
      </div>
    );
  }
);

ChipGroup.displayName = "ChipGroup";

export { CHIPGROUP_VARIANTS };
