import { Badge } from "@/components/Badge/Badge";
import { CalendarIcon } from "@/components/Icon/CalendarIcon";
import { ChevronDownIcon } from "@/components/Icon/ChevronDownIcon";
import { ClockIcon } from "@/components/Icon/ClockIcon";
import { UsersIcon } from "@/components/Icon/UsersIcon";
import { CategoryFilter, getCategoryLabel } from "@/lib/constants/category";
import {
  formatHHMMSS,
  formatParticipantCount,
  formatSessionDuration,
  formatSessionStartDateTime,
} from "@/lib/utils/format";
import { cn } from "@/lib/utils/utils";

interface SessionHistory {
  title: string;
  category: string;
  currentCount: number;
  maxCapacity: number;
  durationTime?: number;
  durationMinutes?: number;
  startTime: string;
  focusedTime: number;
  focusRate: number;
  todoCompletionRate: number;
}

interface SessionHistoryCardProps {
  session: SessionHistory;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function SessionHistoryCard({
  session,
  isExpanded,
  onToggle,
}: SessionHistoryCardProps) {
  const durationMinutes = session.durationMinutes ?? Math.floor((session.durationTime ?? 0) / 60);

  return (
    <div
      className="border-border-[var(--color-alpha-white-8)] bg-surface-strong flex cursor-pointer flex-col justify-center gap-[24px] rounded-[6px] border p-[24px]"
      onClick={onToggle}
    >
      {/* 헤더 영역 */}
      <div className="flex w-full items-start justify-between">
        <div className="gap-xs flex flex-col">
          <p className="text-text-primary text-base font-semibold">{session.title}</p>
          <div className="gap-sm flex items-center">
            <Badge radius="xs" className="border-0">
              {getCategoryLabel(session.category as CategoryFilter)}
            </Badge>
            <div className="gap-xs flex">
              <MetadataItem icon={<UsersIcon className="h-[12px] w-[12px]" />}>
                {formatParticipantCount(session.currentCount, session.maxCapacity)}
              </MetadataItem>
              <MetadataItem icon={<ClockIcon className="h-[12px] w-[12px]" />}>
                {formatSessionDuration(durationMinutes)}
              </MetadataItem>
              <MetadataItem icon={<CalendarIcon className="h-[12px] w-[12px]" />}>
                {formatSessionStartDateTime(session.startTime)}
              </MetadataItem>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "text-icon-secondary flex h-[24px] w-[24px] items-center justify-center transition-transform",
            isExpanded && "rotate-180"
          )}
        >
          <ChevronDownIcon className="h-6 w-6" />
        </div>
      </div>

      {/* 확장 상세 영역 */}
      {isExpanded && (
        <div className="pt-md gap-3xl flex items-center border-t border-t-[var(--color-alpha-white-8)]">
          <StatItem label="집중 시간" value={formatHHMMSS(session.focusedTime)} />
          <StatItem label="집중률" value={`${session.focusRate}%`} />
          <StatItem label="투두 달성률" value={`${session.todoCompletionRate}%`} />
        </div>
      )}
    </div>
  );
}

function MetadataItem({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="gap-2xs text-text-secondary flex items-center justify-center">
      {icon}
      <span className="text-[13px]">{children}</span>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="gap-2xs flex flex-col">
      <p className="text-text-secondary font-regular text-[15px]">{label}</p>
      <p className="text-text-brand-default text-[13px] font-semibold">{value}</p>
    </div>
  );
}
