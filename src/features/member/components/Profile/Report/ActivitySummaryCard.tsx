import ReportCard from "@/components/ReportCard/ReportCard";
import SectionTitle from "@/components/ReportCard/SectionTitle";

export default function ActivitySummaryCard() {
  return (
    <ReportCard>
      <SectionTitle>나의 활동 요약</SectionTitle>
      <div className="p-xl gap-2xl border-border-subtle flex flex-col rounded-md border">
        <div className="gap-2xl flex">
          <div className="flex flex-col">
            <h3 className="text-[16px] font-semibold">총 집중 시간</h3>
            <p className="text-text-brand-default text-[32px] font-bold">00:32:10</p>
          </div>
          <div className="flex flex-col">
            <h3 className="text-[16px] font-semibold">총 집중 시간</h3>
            <p className="text-text-secondary text-[32px] font-bold">00:48:29</p>
          </div>
        </div>

        <div className="bg-surface-strong px-lg py-md flex flex-col gap-[8px] rounded-sm">
          <div className="flex justify-between">
            <p className="text-text-secondary text-[16px] font-semibold">집중도</p>
            <p className="text-text-primary text-[16px] font-semibold">80%</p>
          </div>
          <div>
            {/** TODO(이경환): 게이지바 구현 */}
            게이지바 영역
          </div>
          <p className="text-text-muted font-regular text-[11px]">
            전체 참여 시간 대비 80%를 집중했어요!
          </p>
        </div>
      </div>
    </ReportCard>
  );
}
