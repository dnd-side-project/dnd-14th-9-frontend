import { ProgressBar } from "@/components/ProgressBar/ProgressBar";
import SectionTitle from "@/components/ReportCard/SectionTitle";
import type { CategoryParticipationItem } from "@/features/member/types";
import { CategoryFilter, getCategoryLabel } from "@/lib/constants/category";

interface CategoryParticipationCardProps {
  data: CategoryParticipationItem[];
}

export default function CategoryParticipationCard({ data }: CategoryParticipationCardProps) {
  return (
    <div className="gap-sm md:gap-md lg:gap-lg flex flex-1 flex-col">
      <SectionTitle>카테고리별 세션 참여율</SectionTitle>
      <div className="p-md gap-md border-sm border-border-subtle md:p-xl flex flex-1 flex-col rounded-md">
        {data.map((stat, index) => (
          <div key={stat.categoryName} className="flex h-auto flex-col gap-2 lg:h-10">
            <div className="flex justify-between">
              <p
                className={`text-[13px] font-semibold md:text-[15px] ${
                  index === 0 ? "text-text-brand-default" : "text-text-tertiary"
                }`}
              >
                {getCategoryLabel(stat.categoryName as CategoryFilter)}
              </p>
              <p className="text-text-disabled font-regular text-xs md:text-[13px]">
                {stat.count}회 ({stat.rate}%)
              </p>
            </div>
            <ProgressBar
              progress={stat.rate}
              className="bg-border-default h-1 rounded-[1px]"
              indicatorClassName={index === 0 ? "bg-border-primary-default" : "bg-border-strong"}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
