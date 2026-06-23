import { SkeletonBlock } from "@/components/Skeleton/SkeletonBlock";

interface SessionPageSkeletonProps {
  titleWidthClassName: string;
  ariaHidden?: boolean;
}

export function SessionPageSkeleton({
  titleWidthClassName,
  ariaHidden = false,
}: SessionPageSkeletonProps) {
  return (
    <div className="p-3xl flex flex-col" aria-hidden={ariaHidden}>
      <header className="mb-2xl flex items-start justify-between">
        <SkeletonBlock className={`h-8 ${titleWidthClassName}`} />
        <SkeletonBlock className="h-9 w-20 rounded-md" />
      </header>

      <div className="gap-lg flex flex-col rounded-lg xl:flex-row xl:items-start">
        <SkeletonBlock className="h-[200px] w-full rounded-lg xl:flex-3" />
        <div className="gap-sm flex flex-col xl:flex-7">
          <SkeletonBlock className="h-6 w-16" />
          <SkeletonBlock className="h-8 w-56 max-w-full" />
          <SkeletonBlock className="h-5 w-full" />
          <SkeletonBlock className="h-5 w-40 max-w-full" />
          <SkeletonBlock className="h-16 w-full rounded-lg" />
        </div>
      </div>

      <div className="gap-lg mt-xl flex flex-col md:flex-row">
        <SkeletonBlock className="h-[240px] rounded-2xl md:flex-6" />
        <SkeletonBlock className="h-[240px] rounded-2xl md:flex-4" />
      </div>

      <div className="gap-lg mt-xl flex flex-col xl:flex-row">
        <SkeletonBlock className="h-[280px] rounded-2xl xl:flex-6" />
        <SkeletonBlock className="h-[280px] rounded-2xl xl:flex-4" />
      </div>
    </div>
  );
}
