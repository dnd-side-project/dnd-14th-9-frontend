import { ProgressBar } from "@/components/ProgressBar/ProgressBar";
import ReportCard from "@/components/ReportCard/ReportCard";
import SectionTitle from "@/components/ReportCard/SectionTitle";
import type { SessionPerformanceData } from "@/features/member/types";

const VARIANT_STYLES = {
  primary: {
    text: "text-text-brand-default",
    indicator: "bg-border-primary-subtler",
  },
  secondary: {
    text: "text-text-status-positive-default",
    indicator: "bg-border-secondary-subtler",
  },
};

interface PerformanceMetricItemProps {
  label: string;
  value: number;
  variant: keyof typeof VARIANT_STYLES;
}

function PerformanceMetricItem({ label, value, variant }: PerformanceMetricItemProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div className="gap-xs flex flex-col">
      <p className="text-text-tertiary font-regular text-[15px]">{label}</p>
      <div className="bg-surface-strong p-md flex flex-col gap-[12px] rounded-xs">
        <p className={`${styles.text} text-[24px] font-bold`}>{value}%</p>
        <ProgressBar
          progress={value}
          className="bg-border-default h-[4px]"
          indicatorClassName={styles.indicator}
        />
      </div>
    </div>
  );
}

interface SessionPerformanceCardProps {
  data: SessionPerformanceData;
}

export default function SessionPerformanceCard({ data }: SessionPerformanceCardProps) {
  return (
    <ReportCard>
      <SectionTitle>세션 성과</SectionTitle>
      <div className="flex flex-col">
        <div className="gap-sm grid grid-cols-2">
          <PerformanceMetricItem
            label="투두 달성률"
            value={data.todoCompletionRate}
            variant="primary"
          />
          <PerformanceMetricItem label="집중률" value={data.focusRate} variant="secondary" />
        </div>
      </div>
    </ReportCard>
  );
}
