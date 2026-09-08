import { ProgressBar } from "@/components/ProgressBar/ProgressBar";
import SectionTitle from "@/components/ReportCard/SectionTitle";
import type { ActivitySummaryData } from "@/features/member/types";
import { formatHHMMSS } from "@/lib/utils/format";

interface ActivitySummaryCardProps {
  data: ActivitySummaryData;
  title?: string;
  focusedTimeLabel?: string;
  participationTimeLabel?: string;
  achievementRate?: number;
  achievementRateLabel?: string;
}

export default function ActivitySummaryCard({
  data,
  title = "나의 활동 요약",
  focusedTimeLabel = "총 집중 시간",
  participationTimeLabel = "전체 참여 시간",
  achievementRate,
  achievementRateLabel = "목표 달성률",
}: ActivitySummaryCardProps) {
  return (
    <div className="gap-sm md:gap-md lg:gap-lg flex flex-1 flex-col">
      <SectionTitle>{title}</SectionTitle>
      <div className="p-md gap-lg border-border-subtle md:p-xl md:gap-2xl flex flex-1 flex-col rounded-md border">
        <div className="gap-x-3xl gap-y-md md:gap-x-2xl flex flex-wrap">
          <div className="md:gap-2xs flex flex-col gap-[2px] lg:gap-0">
            <h3 className="text-xs font-semibold md:text-[15px] lg:text-base">
              {focusedTimeLabel}
            </h3>
            <p className="text-text-brand-default text-2xl font-bold lg:text-[32px]">
              {formatHHMMSS(data.focusedTime)}
            </p>
          </div>
          <div className="md:gap-2xs flex flex-col gap-[2px] lg:gap-0">
            <h3 className="text-xs font-semibold md:text-[15px] lg:text-base">
              {participationTimeLabel}
            </h3>
            <p className="text-text-secondary text-2xl font-bold lg:text-[32px]">
              {formatHHMMSS(data.totalParticipationTime)}
            </p>
          </div>
          {achievementRate !== undefined && (
            <>
              <span className="text-text-disabled flex items-start text-2xl max-md:hidden">|</span>
              <div className="md:gap-2xs flex flex-col gap-[2px] lg:gap-0">
                <h3 className="text-xs font-semibold md:text-[15px] lg:text-base">
                  {achievementRateLabel}
                </h3>
                <p className="text-text-secondary text-2xl font-bold lg:text-[32px]">
                  {achievementRate}%
                </p>
              </div>
            </>
          )}
        </div>

        <div className="bg-surface-strong px-md py-sm md:px-lg md:py-md flex flex-col gap-[8px] rounded-sm">
          <div className="flex justify-between">
            <p className="text-text-secondary text-xs font-semibold md:text-base">평균 집중도</p>
            <p className="text-text-primary text-[15px] font-semibold md:text-base">
              {data.focusRate}%
            </p>
          </div>
          <ProgressBar
            progress={data.focusRate}
            className="bg-border-default h-[4px] rounded-[1px]"
            indicatorClassName="bg-border-strong"
          />
          <p className="text-text-muted font-regular text-[11px]">
            전체 참여 시간 대비 {data.focusRate}%를 집중했어요!
          </p>
        </div>
      </div>
    </div>
  );
}
