import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@/lib/utils/utils";

export type ButtonGroupProps = HTMLAttributes<HTMLDivElement>;

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("inline-flex flex-row flex-wrap items-center gap-2", className)}
      role="group"
      {...props}
    >
      {children}
    </div>
  )
);

ButtonGroup.displayName = "ButtonGroup";
