function SkeletonBlock({ className }: { className: string }) {
  return <div className={`bg-surface-strong animate-pulse rounded-sm ${className}`} />;
}

export function WaitingRoomRouteLoading() {
  return (
    <>
      <div className="bg-surface-strong relative left-1/2 ml-[-50vw] h-16 w-screen animate-pulse" />

      <div className="gap-3xl p-3xl flex flex-col">
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

        <SkeletonBlock className="h-52 w-full rounded-2xl" />

        <div className="gap-lg flex flex-col lg:flex-row">
          <SkeletonBlock className="h-[320px] flex-1 rounded-2xl" />
          <SkeletonBlock className="h-[320px] flex-1 rounded-2xl" />
        </div>
      </div>
    </>
  );
}
