import ReportCard from "@/components/ReportCard/ReportCard";
import SectionTitle from "@/components/ReportCard/SectionTitle";

export default function SessionHistorySkeleton() {
  return (
    <ReportCard className="gap-xl">
      <SectionTitle>지금까지 참여한 세션</SectionTitle>
      <div className="gap-lg flex flex-col">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="border-border-[var(--color-alpha-white-8)] bg-surface-strong flex flex-col justify-center gap-[24px] rounded-[6px] border p-[24px]"
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
    </ReportCard>
  );
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`bg-border-subtle animate-pulse rounded-sm ${className || ""}`} />;
}
