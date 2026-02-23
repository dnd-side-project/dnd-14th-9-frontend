import { ProgressBar } from "@/components/ProgressBar/ProgressBar";

interface FocusTimeCardProps {
  /** 총 집중 시간 (분) */
  focusTimeMinutes: number;
  /** 전체 참여 시간 (분) */
  totalDurationMinutes: number;
  /** 집중도 (0-100) */
  focusRate: number;
}

function formatMinutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const secs = 0;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function FocusTimeCard({
  focusTimeMinutes,
  totalDurationMinutes,
  focusRate,
}: FocusTimeCardProps) {
  return (
    <article className="p-lg flex flex-1 flex-col rounded-lg bg-gray-900">
      <h3 className="text-lg font-semibold text-gray-50">나의 집중 시간</h3>

      <div className="mt-lg gap-2xl flex">
        <div className="gap-xs flex flex-col">
          <span className="text-sm text-gray-400">총 집중 시간</span>
          <span className="text-2xl font-bold text-gray-50">
            {formatMinutesToTime(focusTimeMinutes)}
          </span>
        </div>
        <div className="gap-xs flex flex-col">
          <span className="text-sm text-gray-400">전체 참여 시간</span>
          <span className="text-2xl font-bold text-gray-50">
            {formatMinutesToTime(totalDurationMinutes)}
          </span>
        </div>
      </div>

      <div className="pt-lg mt-auto">
        <div className="mb-sm flex items-center justify-between">
          <span className="text-sm text-gray-400">집중도</span>
          <span className="text-sm font-semibold text-gray-50">{focusRate}%</span>
        </div>
        <ProgressBar progress={focusRate} />
      </div>
    </article>
  );
}
