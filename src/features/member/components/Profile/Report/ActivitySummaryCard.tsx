import { ProgressBar } from "@/components/ProgressBar/ProgressBar";
import ReportCard from "@/components/ReportCard/ReportCard";
import SectionTitle from "@/components/ReportCard/SectionTitle";
import type { ActivitySummaryData } from "@/features/member/types";
import { formatHHMMSS } from "@/lib/utils/format";

interface ActivitySummaryCardProps {
  data: ActivitySummaryData;
}

export default function ActivitySummaryCard({ data }: ActivitySummaryCardProps) {
  return (
    <ReportCard>
      <SectionTitle>나의 활동 요약</SectionTitle>
      <div className="p-xl gap-2xl border-border-subtle flex flex-1 flex-col rounded-md border">
        <div className="gap-2xl flex">
          <div className="flex flex-col">
            <h3 className="text-[16px] font-semibold">총 집중 시간</h3>
            <p className="text-text-brand-default text-[32px] font-bold">
              {formatHHMMSS(data.focusedTime)}
            </p>
          </div>
          <div className="flex flex-col">
            <h3 className="text-[16px] font-semibold">총 참여 시간</h3>
            <p className="text-text-secondary text-[32px] font-bold">
              {formatHHMMSS(data.totalParticipationTime)}
            </p>
          </div>
        </div>

        <div className="bg-surface-strong px-lg py-md flex flex-col gap-[8px] rounded-sm">
          <div className="flex justify-between">
            <p className="text-text-secondary text-[16px] font-semibold">집중도</p>
            <p className="text-text-primary text-[16px] font-semibold">{data.focusRate}%</p>
          </div>
          <ProgressBar
            progress={data.focusRate}
            className="bg-border-default h-[4px]"
            indicatorClassName="bg-border-strong"
          />
          <p className="text-text-muted font-regular text-[11px]">
            전체 참여 시간 대비 {data.focusRate}%를 집중했어요!
          </p>
        </div>
      </div>
    </ReportCard>
  );
}
