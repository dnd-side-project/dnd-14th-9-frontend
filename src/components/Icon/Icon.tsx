import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type SVGProps } from "react";

import { cn } from "@/lib/utils/utils";

const iconVariants = cva("inline-block shrink-0", {
  variants: {
    size: {
      xlarge: "h-8 w-8",
      large: "h-7 w-7",
      medium: "h-6 w-6",
      small: "h-5 w-5",
      xsmall: "h-4 w-4",
    },
  },
  defaultVariants: {
    size: "medium",
  },
});

export interface IconProps
  extends Omit<SVGProps<SVGSVGElement>, "children">, VariantProps<typeof iconVariants> {
  svg: React.ReactNode;
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ className, size, svg, ...props }, ref) => {
    return (
      <span
        ref={ref as React.Ref<HTMLSpanElement>}
        className={cn(iconVariants({ size, className }))}
        {...(props as React.HTMLAttributes<HTMLSpanElement>)}
      >
        {svg}
      </span>
    );
  }
);

Icon.displayName = "Icon";

export { iconVariants };
