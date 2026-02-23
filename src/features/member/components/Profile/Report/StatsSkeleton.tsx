import ReportCard from "@/components/ReportCard/ReportCard";

export default function StatsSkeleton() {
  return (
    <div className="gap-lg grid grid-cols-2">
      <ActivitySummaryCardSkeleton />
      <CategoryParticipationCardSkeleton />
      <ReceivedEmojiCardSkeleton />
      <SessionPerformanceCardSkeleton />
    </div>
  );
}

function ActivitySummaryCardSkeleton() {
  return (
    <ReportCard>
      <SkeletonBlock className="h-6 w-36" />
      <div className="p-xl gap-2xl border-border-subtle flex flex-col rounded-md border">
        <div className="gap-2xl flex">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="gap-sm flex flex-col">
              <SkeletonBlock className="h-5 w-24" />
              <SkeletonBlock className="h-10 w-36" />
            </div>
          ))}
        </div>
        <div className="bg-surface-strong px-lg py-md flex flex-col gap-[8px] rounded-sm">
          <div className="flex justify-between">
            <SkeletonBlock className="h-5 w-16" />
            <SkeletonBlock className="h-5 w-10" />
          </div>
          <SkeletonBlock className="bg-border-default h-[4px] w-full rounded-full" />
          <SkeletonBlock className="h-3 w-44" />
        </div>
      </div>
    </ReportCard>
  );
}

function CategoryParticipationCardSkeleton() {
  const itemWidths = ["w-24", "w-20", "w-28", "w-16"];

  return (
    <ReportCard>
      <SkeletonBlock className="h-6 w-44" />
      <div className="p-xl gap-md border-sm border-border-subtle flex flex-col rounded-md border">
        {itemWidths.map((labelWidth) => (
          <div key={labelWidth} className="flex flex-col gap-[8px]">
            <div className="flex justify-between">
              <SkeletonBlock className={`h-5 ${labelWidth}`} />
              <SkeletonBlock className="h-4 w-20" />
            </div>
            <SkeletonBlock className="bg-border-default h-[4px] w-full rounded-full" />
          </div>
        ))}
      </div>
    </ReportCard>
  );
}

function ReceivedEmojiCardSkeleton() {
  return (
    <ReportCard>
      <SkeletonBlock className="h-6 w-24" />
      <div className="p-xl border-sm border-border-subtle flex gap-[16px] rounded-md border">
        <div className="px-xl py-2xl bg-surface-strong gap-lg flex flex-col items-center justify-center rounded-md">
          <SkeletonBlock className="h-12 w-12 rounded-md" />
          <div className="gap-xs flex flex-col items-center">
            <SkeletonBlock className="h-8 w-10" />
            <SkeletonBlock className="h-3 w-36" />
          </div>
        </div>

        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="gap-xs py-lg px-md bg-surface-strong flex flex-col items-center justify-center self-end rounded-sm"
          >
            <SkeletonBlock className="h-8 w-8 rounded-sm" />
            <SkeletonBlock className="h-5 w-8" />
          </div>
        ))}
      </div>
    </ReportCard>
  );
}

function SessionPerformanceCardSkeleton() {
  return (
    <ReportCard>
      <SkeletonBlock className="h-6 w-24" />
      <div className="flex flex-col">
        <div className="gap-sm grid grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="gap-xs flex flex-col">
              <SkeletonBlock className="h-5 w-20" />
              <div className="bg-surface-strong p-md flex flex-col gap-[12px] rounded-xs">
                <SkeletonBlock className="h-8 w-14" />
                <SkeletonBlock className="bg-border-default h-[4px] w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </ReportCard>
  );
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`bg-surface-strong animate-pulse rounded-sm ${className}`} />;
}
