import { cn } from "@/lib/utils/utils";

import { AlertCircleFilledIcon } from "../Icon/AlertCircleFilledIcon";
import { CheckIcon } from "../Icon/CheckIcon";

export type HelperTextType = "default" | "positive" | "negative" | "warning";

export interface HelperTextProps {
  id?: string;
  text: string;
  type?: HelperTextType;
  className?: string;
}

const TYPE_STYLES: Record<HelperTextType, string> = {
  default: "text-text-tertiary",
  positive: "text-text-status-positive-default",
  negative: "text-text-status-negative-default",
  warning: "text-text-status-warning-default",
};

export function HelperText({ id, text, type = "default", className }: HelperTextProps) {
  const isPositiveOrDefault = type === "default" || type === "positive";

  return (
    // 위 요소와의 간격은 부모의 gap(8px)이 정한다 (시안: 도움말 텍스트 자체에는 위 여백이 없다)
    <div id={id} className={cn("flex items-center gap-1", TYPE_STYLES[type], className)}>
      {isPositiveOrDefault ? (
        <CheckIcon className="h-4 w-4 shrink-0" />
      ) : (
        <AlertCircleFilledIcon className="h-4 w-4 shrink-0" />
      )}
      <p className="text-xs leading-[1.4] tracking-[0.12px]">{text}</p>
    </div>
  );
}
