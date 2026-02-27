import { cn } from "@/lib/utils/utils";

const SKELETON_INTEREST_COUNT = 3;
const SKELETON_MENU_COUNT = 2;

interface ProfilePopupSkeletonProps {
  className?: string;
}

export function ProfilePopupSkeleton({ className }: ProfilePopupSkeletonProps) {
  return (
    <div
      className={cn(
        "px-lg py-md gap-sm border-border-default bg-surface-default flex w-107 animate-pulse flex-col rounded-lg border",
        className
      )}
    >
      {/* ProfileHeader */}
      <div className="py-sm gap-sm flex">
        <div className="bg-surface-strong h-12 w-12 shrink-0 rounded-full" />
        <div className="gap-3xs flex flex-col justify-center">
          <div className="gap-xs flex items-center">
            <div className="bg-surface-strong h-5 w-20 rounded-md" />
            <div className="bg-surface-strong h-5 w-16 rounded-md" />
          </div>
          <div className="bg-surface-strong h-4 w-36 rounded-md" />
        </div>
      </div>

      <div className="gap-md flex flex-col">
        {/* InterestBadges */}
        <div className="gap-xs flex">
          {Array.from({ length: SKELETON_INTEREST_COUNT }, (_, i) => (
            <div key={i} className="gap-xs flex items-center">
              <div className="bg-surface-strong h-4 w-8 rounded-md" />
              <div className="bg-surface-strong h-6 w-14 rounded-full" />
            </div>
          ))}
        </div>

        {/* FocusStatusItem */}
        <div className="p-lg gap-md border-border-subtle bg-surface-strong/30 flex flex-col rounded-md border">
          <div className="flex items-center justify-between">
            <div className="gap-2xs flex flex-col">
              <div className="bg-surface-strong h-4 w-10 rounded-md" />
              <div className="bg-surface-strong h-5 w-28 rounded-md" />
            </div>
            <div className="bg-surface-strong h-14 w-14 rounded-full" />
          </div>
          <div className="bg-surface-subtler h-px w-full" />
          <div className="gap-xs flex flex-col">
            <div className="bg-surface-strong h-4 w-16 rounded-md" />
            <div className="flex items-center justify-between">
              <div className="bg-surface-strong h-5 w-10 rounded-md" />
              <div className="bg-surface-strong h-3 w-8 rounded-md" />
            </div>
            <div className="bg-surface-strong h-1 w-full rounded-full" />
          </div>
        </div>

        {/* MenuLinks */}
        {Array.from({ length: SKELETON_MENU_COUNT }, (_, i) => (
          <div
            key={i}
            className="border-border-default bg-surface-default pr-md pl-lg py-md flex items-center rounded-md border"
          >
            <div className="gap-sm flex items-center">
              <div className="bg-surface-strong h-5 w-5 rounded-full" />
              <div className="bg-surface-strong h-4 w-20 rounded-md" />
            </div>
          </div>
        ))}

        {/* Logout button */}
        <div className="flex justify-end">
          <div className="bg-surface-strong h-9 w-24 rounded-md" />
        </div>
      </div>
    </div>
  );
}
