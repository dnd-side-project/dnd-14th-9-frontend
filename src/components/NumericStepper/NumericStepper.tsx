import { Button } from "@/components/Button/Button";
import { MinusIcon } from "@/components/Icon/MinusIcon";
import { PlusIcon } from "@/components/Icon/PlusIcon";
import { cn } from "@/lib/utils/utils";

interface NumericStepperProps {
  label: string;
  hint: string;
  value: number;
  displayValue: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  className?: string;
}

export function NumericStepper({
  label,
  hint,
  value,
  displayValue,
  min,
  max,
  step,
  onChange,
  className,
}: NumericStepperProps) {
  const isAtMin = value <= min;
  const isAtMax = value >= max;

  return (
    <div className={cn("shrink-0 rounded-sm border border-gray-700 p-4", className)}>
      <div className="flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-base">{label}</span>
          <span className="text-text-muted text-[10px]">{hint}</span>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            variant={isAtMin ? "solid" : "outlined"}
            colorScheme="secondary"
            size="xsmall"
            iconOnly
            leftIcon={<MinusIcon size="xsmall" />}
            onClick={() => onChange(Math.max(min, value - step))}
            disabled={isAtMin}
            className="h-7 w-7 rounded-xs"
          />
          <span className="text-text-secondary text-center text-sm">{displayValue}</span>
          <Button
            type="button"
            variant={isAtMax ? "solid" : "outlined"}
            colorScheme="secondary"
            size="xsmall"
            iconOnly
            leftIcon={<PlusIcon size="xsmall" />}
            onClick={() => onChange(Math.min(max, value + step))}
            disabled={isAtMax}
            className="h-7 w-7 rounded-xs"
          />
        </div>
      </div>
    </div>
  );
}
