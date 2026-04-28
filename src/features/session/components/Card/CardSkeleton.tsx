import { cn } from "@/lib/utils/utils";

interface CardSkeletonProps {
  className?: string;
  /** Figma layout 변형 (default: "vertical") */
  layout?: "vertical" | "horizontal";
  /** Figma size 변형 (default: "md") */
  size?: "md" | "sm";
}

export function CardSkeleton({ className, layout = "vertical", size = "md" }: CardSkeletonProps) {
  const isHorizontal = layout === "horizontal";
  const isSm = size === "sm";

  const thumbnailClassName = isHorizontal
    ? isSm
      ? "self-stretch aspect-auto w-auto shrink-0 min-w-[120px]"
      : "h-[180px] w-[290px] shrink-0"
    : "aspect-[320/170] w-full";

  const rootClassName = cn(
    "flex w-full animate-pulse",
    isHorizontal
      ? cn("flex-row items-start", isSm ? "gap-3" : "gap-4")
      : cn("flex-col", isSm ? "gap-3" : "gap-4"),
    className
  );

  const contentClassName = cn(
    "flex flex-col",
    isSm ? "gap-3 py-1" : "gap-4 py-2",
    isHorizontal ? "flex-1 min-w-0" : "w-full"
  );

  return (
    <div className={rootClassName}>
      {/* Thumbnail placeholder */}
      <div className={cn("bg-surface-strong rounded-xs", thumbnailClassName)} />

      <div className={contentClassName}>
        <div className="flex flex-col gap-2">
          {/* Badge 행 */}
          <div className="flex items-center gap-2">
            <div className="bg-surface-strong h-5 w-14 rounded-xs" />
            <div className="bg-surface-strong h-5 w-16 rounded-full" />
          </div>

          {/* Title + subtitle */}
          <div className="flex flex-col gap-1">
            <div className={cn("bg-surface-strong w-3/4 rounded-md", isSm ? "h-5" : "h-6")} />
            <div className="bg-surface-strong h-4 w-1/2 rounded-md" />
          </div>
        </div>

        {/* CardMeta */}
        <div className="flex items-center gap-2">
          <div className={cn("bg-surface-strong rounded-md", isSm ? "h-3 w-10" : "h-3 w-12")} />
          <div className={cn("bg-surface-strong rounded-md", isSm ? "h-3 w-10" : "h-3 w-12")} />
          <div className={cn("bg-surface-strong rounded-md", isSm ? "h-3 w-16" : "h-3 w-20")} />
        </div>
      </div>
    </div>
  );
}
