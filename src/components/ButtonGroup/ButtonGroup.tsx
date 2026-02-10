import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@/lib/utils/utils";

const BUTTONGROUP_VARIANTS = cva(["inline-flex", "flex-row", "flex-wrap", "items-center", "gap-2"]);

export interface ButtonGroupProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof BUTTONGROUP_VARIANTS> {}

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(BUTTONGROUP_VARIANTS({ className }))} role="group" {...props}>
        {children}
      </div>
    );
  }
);

ButtonGroup.displayName = "ButtonGroup";

export { BUTTONGROUP_VARIANTS };
