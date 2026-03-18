import { type HTMLAttributes } from "react";

import { cn } from "@/lib/utils/utils";

export type ButtonGroupProps = HTMLAttributes<HTMLDivElement> & {
  ref?: React.Ref<HTMLDivElement>;
};

export function ButtonGroup({ className, children, ref, ...props }: ButtonGroupProps) {
  return (
    <div
      ref={ref}
      className={cn("inline-flex flex-row flex-wrap items-center gap-2", className)}
      role="group"
      {...props}
    >
      {children}
    </div>
  );
}
