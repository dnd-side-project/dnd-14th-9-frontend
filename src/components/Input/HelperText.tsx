import { cn } from "@/lib/utils/utils";

import { CheckIcon } from "../Icon/CheckIcon";
import { InfoIcon } from "../Icon/InfoIcon";

export type HelperTextType = "default" | "positive" | "negative" | "warning";

export interface HelperTextProps {
  id?: string;
  text: string;
  type?: HelperTextType;
  className?: string;
}

const typeStyles: Record<HelperTextType, string> = {
  default: "text-text-tertiary",
  positive: "text-text-status-positive-default",
  negative: "text-text-status-negative-default",
  warning: "text-text-status-warning-default",
};

export function HelperText({ id, text, type = "default", className }: HelperTextProps) {
  const isPositiveOrDefault = type === "default" || type === "positive";

  return (
    <div id={id} className={cn("mt-1 flex items-center gap-1", typeStyles[type], className)}>
      {isPositiveOrDefault ? (
        <CheckIcon className="h-4 w-4 shrink-0" />
      ) : (
        <InfoIcon className="h-4 w-4 shrink-0" />
      )}
      <p className="font-pretendard text-xs tracking-[0.12px]">{text}</p>
    </div>
  );
}
