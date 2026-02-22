import { ProgressBar } from "@/components/ProgressBar/ProgressBar";
import ReportCard from "@/components/ReportCard/ReportCard";
import SectionTitle from "@/components/ReportCard/SectionTitle";
import { CategoryFilter, getCategoryLabel } from "@/lib/constants/category";

const MOCK_SESSION_PARTICIPATION_STATS = [
  {
    categoryName: "DESIGN",
    count: 10,
    rate: 50,
  },
  {
    categoryName: "DEVELOPMENT",
    count: 10,
    rate: 50,
  },
  {
    categoryName: "TEAM_PROJECT",
    count: 0,
    rate: 0,
  },
  {
    categoryName: "FREE",
    count: 0,
    rate: 0,
  },
];

export default function CategoryParticipationCard() {
  return (
    <ReportCard>
      <SectionTitle>카테고리별 세션 참여율</SectionTitle>
      <div className="p-xl gap-md border-sm border-border-subtle flex flex-col rounded-md border">
        {MOCK_SESSION_PARTICIPATION_STATS.map((stat, index) => (
          <div key={stat.categoryName} className="flex flex-col gap-[8px]">
            <div className="flex justify-between">
              <p
                className={`text-[15px] font-semibold ${
                  index === 0 ? "text-text-brand-default" : "text-text-tertiary"
                }`}
              >
                {getCategoryLabel(stat.categoryName as CategoryFilter)}
              </p>
              <p className="text-text-disabled font-regular text-[13px]">
                {stat.count}회 ({stat.rate}%)
              </p>
            </div>
            <ProgressBar
              progress={stat.rate}
              className="bg-border-default h-[4px]"
              indicatorClassName={index === 0 ? "bg-border-primary-default" : "bg-border-strong"}
            />
          </div>
        ))}
      </div>
    </ReportCard>
  );
}
