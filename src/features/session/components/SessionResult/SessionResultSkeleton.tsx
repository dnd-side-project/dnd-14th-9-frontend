function SkeletonBlock({ className }: { className: string }) {
  return <div className={`bg-surface-strong animate-pulse rounded-sm ${className}`} />;
}

export function SessionResultSkeleton() {
  return (
    <>
      {/* SessionDetailSection skeleton */}
      <section className="gap-lg flex rounded-lg">
        <div className="flex-3">
          <SkeletonBlock className="h-[200px] w-full rounded-lg" />
        </div>
        <div className="gap-sm flex flex-7 flex-col">
          <SkeletonBlock className="h-6 w-16" />
          <SkeletonBlock className="h-8 w-48" />
          <SkeletonBlock className="h-5 w-full" />
          <SkeletonBlock className="h-5 w-32" />
          <SkeletonBlock className="h-16 w-full rounded-lg" />
        </div>
      </section>

      {/* ActivitySummaryCard + ReceivedEmojiCard skeleton */}
      <div className="gap-lg flex">
        <SkeletonBlock className="h-[200px] flex-1 rounded-lg" />
        <SkeletonBlock className="h-[200px] flex-1 rounded-lg" />
      </div>

      {/* Content section skeleton */}
      <SkeletonBlock className="h-[300px] w-full rounded-lg" />

      {/* Buttons skeleton */}
      <div className="mt-2xl mb-3xl gap-md flex justify-center">
        <SkeletonBlock className="h-12 w-32 rounded-md" />
        <SkeletonBlock className="h-12 w-44 rounded-md" />
      </div>
    </>
  );
}
