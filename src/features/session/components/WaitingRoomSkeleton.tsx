import { SkeletonBlock } from "@/components/Skeleton/SkeletonBlock";

interface WaitingRoomSkeletonProps {
  infoCardHeightClassName: string;
  participantCardHeightClassName: string;
  ariaHidden?: boolean;
}

export function WaitingRoomSkeleton({
  infoCardHeightClassName,
  participantCardHeightClassName,
  ariaHidden = false,
}: WaitingRoomSkeletonProps) {
  return (
    <>
      <div className="relative left-1/2 ml-[-50vw] w-screen" aria-hidden={ariaHidden}>
        <div className="bg-surface-strong h-16 w-full animate-pulse" />
      </div>

      <div className="gap-3xl p-3xl flex flex-col" aria-hidden={ariaHidden}>
        <header className="mb-2xl flex items-start justify-between">
          <div className="gap-lg flex items-start">
            <SkeletonBlock className="mt-1 h-6 w-6 rounded-full" />
            <div className="flex flex-col gap-2">
              <SkeletonBlock className="h-8 w-40" />
              <SkeletonBlock className="h-5 w-72 max-w-full" />
            </div>
          </div>
          <SkeletonBlock className="h-9 w-20 rounded-md" />
        </header>

        <SkeletonBlock className={`${infoCardHeightClassName} w-full rounded-2xl`} />

        <div className="gap-lg flex flex-col lg:flex-row">
          <SkeletonBlock className={`${participantCardHeightClassName} flex-1 rounded-2xl`} />
          <SkeletonBlock className={`${participantCardHeightClassName} flex-1 rounded-2xl`} />
        </div>
      </div>
    </>
  );
}
