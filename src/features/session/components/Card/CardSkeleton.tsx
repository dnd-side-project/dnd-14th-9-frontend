import { cn } from "@/lib/utils/utils";

interface CardSkeletonProps {
  className?: string;
}

export function CardSkeleton({ className }: CardSkeletonProps) {
  return (
    <div className={cn("flex w-full max-w-69 animate-pulse flex-col gap-4", className)}>
      {/* Thumbnail */}
      <div className="bg-surface-strong h-40 w-full rounded-lg" />

      <div className="flex flex-col gap-2">
        {/* Badge 행 */}
        <div className="flex items-center gap-2">
          <div className="bg-surface-strong h-5 w-14 rounded-full" />
          <div className="bg-surface-strong h-5 w-16 rounded-full" />
        </div>

        {/* Title */}
        <div className="bg-surface-strong h-6 w-3/4 rounded-md" />

        {/* Description */}
        <div className="bg-surface-strong h-4 w-1/2 rounded-md" />

        {/* CardMeta */}
        <div className="flex items-center gap-4">
          <div className="bg-surface-strong h-3 w-12 rounded-md" />
          <div className="bg-surface-strong h-3 w-12 rounded-md" />
          <div className="bg-surface-strong h-3 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}
