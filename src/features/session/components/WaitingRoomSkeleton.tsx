import { SkeletonBlock } from "@/components/Skeleton/SkeletonBlock";

interface WaitingRoomSkeletonProps {
  /** 반응형 클래스 문자열 가능 (예: "h-[560px] xl:h-[360px]"). */
  infoCardHeightClassName: string;
  /** 반응형 클래스 문자열 가능 (예: "h-[360px] xl:h-[628px]"). */
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

      <div
        className="gap-xl md:gap-2xl xl:gap-3xl p-md md:p-xl xl:p-3xl flex flex-col"
        aria-hidden={ariaHidden}
      >
        <header className="mb-lg md:mb-2xl flex items-start justify-between">
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

        <div className="gap-lg flex flex-col xl:flex-row">
          <SkeletonBlock
            className={`${participantCardHeightClassName} w-full rounded-2xl xl:flex-6`}
          />
          <SkeletonBlock
            className={`${participantCardHeightClassName} w-full rounded-2xl xl:flex-4`}
          />
        </div>
      </div>
    </>
  );
}
