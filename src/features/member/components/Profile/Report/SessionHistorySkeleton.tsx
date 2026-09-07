import SectionTitle from "@/components/ReportCard/SectionTitle";

export default function SessionHistorySkeleton() {
  return (
    <div className="gap-sm md:gap-md lg:gap-xl flex flex-1 flex-col">
      <SectionTitle>지금까지 참여한 세션</SectionTitle>
      <div className="gap-sm md:gap-lg flex flex-col">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="border-border-[var(--color-alpha-white-8)] bg-surface-strong flex flex-col justify-center gap-4 rounded-[6px] border p-4 md:gap-[24px] md:p-[24px]"
          >
            <div className="flex w-full items-start justify-between">
              <div className="gap-xs flex flex-col">
                <SkeletonBlock className="h-[22px] w-[200px]" />
                <div className="gap-sm mt-1 flex items-center">
                  <SkeletonBlock className="h-[24px] w-[50px] rounded" />
                  <div className="gap-xs flex">
                    <SkeletonBlock className="h-[18px] w-[60px]" />
                    <SkeletonBlock className="h-[18px] w-[60px]" />
                    <SkeletonBlock className="h-[18px] w-[120px]" />
                  </div>
                </div>
              </div>
              <SkeletonBlock className="h-[24px] w-[24px] rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`bg-border-subtle animate-pulse rounded-sm ${className || ""}`} />;
}
