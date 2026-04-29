import { cn } from "@/lib/utils/utils";

interface CardSkeletonProps {
  className?: string;
  /** Figma layout 변형 (default: "vertical") */
  layout?: "vertical" | "horizontal";
  /** Figma size 변형 또는 명시적 반응형 density (default: "md") */
  size?: "md" | "sm" | "responsive";
}

export function CardSkeleton({ className, layout = "vertical", size = "md" }: CardSkeletonProps) {
  const isHorizontal = layout === "horizontal";
  const isSm = size === "sm";

  const thumbnailClassName = isHorizontal
    ? isSm
      ? "self-stretch aspect-auto w-auto shrink-0"
      : size === "md"
        ? "h-[180px] w-[290px] shrink-0 aspect-auto"
        : "self-stretch aspect-auto w-auto shrink-0 md:h-[180px] md:w-[290px] md:self-auto"
    : "aspect-[320/170] w-full";

  const rootClassName = cn(
    "flex w-full animate-pulse",
    isHorizontal
      ? cn(
          "flex-row items-start",
          size === "sm" && "gap-3",
          size === "md" && "gap-4",
          size === "responsive" && "gap-3 md:gap-4"
        )
      : cn("flex-col", size === "md" ? "gap-4" : size === "sm" ? "gap-3" : "gap-3 md:gap-4"),
    className
  );

  const contentClassName = cn(
    "flex flex-col",
    size === "sm" && "gap-3 py-1",
    size === "md" && "gap-4 py-2",
    size === "responsive" && "gap-3 py-1 md:gap-4 md:py-2",
    isHorizontal ? "flex-1 min-w-0" : "w-full"
  );

  return (
    <div className={rootClassName}>
      <div className={cn("bg-surface-strong rounded-xs", thumbnailClassName)} />

      <div className={contentClassName}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-surface-strong h-5 w-14 rounded-xs" />
            <div className="bg-surface-strong h-5 w-16 rounded-full" />
          </div>

          <div className="flex flex-col gap-1">
            <div
              className={cn(
                "bg-surface-strong w-3/4 rounded-md",
                size === "sm" && "h-5",
                size === "md" && "h-6",
                size === "responsive" && "h-5 md:h-6"
              )}
            />
            <div className="bg-surface-strong h-4 w-1/2 rounded-md" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={cn(
              "bg-surface-strong rounded-md",
              size === "sm" && "h-3 w-10",
              size === "md" && "h-3 w-12",
              size === "responsive" && "h-3 w-10 md:w-12"
            )}
          />
          <div
            className={cn(
              "bg-surface-strong rounded-md",
              size === "sm" && "h-3 w-10",
              size === "md" && "h-3 w-12",
              size === "responsive" && "h-3 w-10 md:w-12"
            )}
          />
          <div
            className={cn(
              "bg-surface-strong rounded-md",
              size === "sm" && "h-3 w-16",
              size === "md" && "h-3 w-20",
              size === "responsive" && "h-3 w-16 md:w-20"
            )}
          />
        </div>
      </div>
    </div>
  );
}
