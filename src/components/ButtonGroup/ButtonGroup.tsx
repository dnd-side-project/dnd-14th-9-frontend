import { type HTMLAttributes } from "react";

import { cn } from "@/lib/utils/utils";

export type ButtonGroupProps = HTMLAttributes<HTMLDivElement> & {
  layout?: "single" | "dual";
  horizontal?: boolean;
  ref?: React.Ref<HTMLDivElement>;
};

export function ButtonGroup({
  className,
  children,
  layout = "dual",
  horizontal = true,
  ref,
  ...props
}: ButtonGroupProps) {
  return (
    <div
      ref={ref}
      className={cn(
        "relative inline-flex",
        horizontal
          ? "gap-md flex-row flex-wrap content-start items-start"
          : cn(
              "flex-col content-stretch items-center",
              layout === "dual" ? "gap-sm" : "gap-y-md flex-wrap content-start gap-x-0"
            ),
        className
      )}
      role="group"
      {...props}
    >
      {children}
    </div>
  );
}
