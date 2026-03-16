function SkeletonBlock({ className }: { className: string }) {
  return <div className={`bg-surface-strong animate-pulse rounded-sm ${className}`} />;
}

export function SessionPageRouteLoading() {
  return (
    <div className="p-3xl flex flex-col">
      <header className="mb-2xl flex items-start justify-between">
        <SkeletonBlock className="h-8 w-36" />
        <SkeletonBlock className="h-9 w-20 rounded-md" />
      </header>

      <div className="gap-lg flex flex-col rounded-lg lg:flex-row">
        <SkeletonBlock className="h-[200px] w-full rounded-lg lg:flex-3" />
        <div className="gap-sm flex flex-col lg:flex-7">
          <SkeletonBlock className="h-6 w-16" />
          <SkeletonBlock className="h-8 w-56 max-w-full" />
          <SkeletonBlock className="h-5 w-full" />
          <SkeletonBlock className="h-5 w-40 max-w-full" />
          <SkeletonBlock className="h-16 w-full rounded-lg" />
        </div>
      </div>

      <div className="mt-xl">
        <SkeletonBlock className="h-[240px] w-full rounded-2xl" />
      </div>

      <div className="gap-lg mt-xl flex flex-col lg:flex-row">
        <SkeletonBlock className="h-[280px] flex-1 rounded-2xl" />
        <SkeletonBlock className="h-[280px] flex-1 rounded-2xl" />
      </div>
    </div>
  );
}
