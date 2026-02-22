import { useState, useEffect, type ChangeEvent } from "react";

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
  hideHeader?: boolean;
  allowKeyboardInput?: boolean;
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
  hideHeader,
  allowKeyboardInput,
}: NumericStepperProps) {
  const isAtMin = value <= min;
  const isAtMax = value >= max;
  const nextDecrementValue = Math.max(min, value - step);
  const nextIncrementValue = Math.min(max, value + step);

  const [inputStr, setInputStr] = useState(String(value));

  // value가 버튼(+/-)으로 바뀌면 inputStr도 동기화
  useEffect(() => {
    setInputStr(String(value));
  }, [value]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setInputStr(raw);

    if (raw === "") {
      return;
    }

    const num = parseInt(raw, 10);
    if (!isNaN(num) && num >= min && num <= max) {
      onChange(num);
    }
  };

  const handleInputBlur = () => {
    const num = parseInt(inputStr, 10);
    if (isNaN(num) || num < min) {
      onChange(min);
      setInputStr(String(min));
      return;
    }

    if (num > max) {
      onChange(max);
      setInputStr(String(max));
      return;
    }

    setInputStr(String(num));
  };

  const handleDecrementClick = () => {
    onChange(nextDecrementValue);
  };

  const handleIncrementClick = () => {
    onChange(nextIncrementValue);
  };

  return (
    <div className={cn("p-md border-border-default shrink-0 rounded-sm border", className)}>
      <div className="flex h-full flex-col gap-[20px]">
        {!hideHeader && (
          <div className="flex items-center justify-between">
            <span className="text-text-secondary text-base">{label}</span>
            <span className="text-text-muted text-[10px]">{hint}</span>
          </div>
        )}
        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            variant={isAtMin ? "solid" : "outlined"}
            colorScheme="secondary"
            size="xsmall"
            iconOnly
            leftIcon={<MinusIcon className="h-[13px] w-[13px]" />}
            onClick={handleDecrementClick}
            disabled={isAtMin}
            className="flex h-7 w-7 min-w-0 items-center justify-center rounded-xs p-0"
          />
          {allowKeyboardInput ? (
            <div className="bg-surface-strong px-xs py-2xs flex items-center gap-0.5 rounded-xs">
              <input
                type="text"
                inputMode="numeric"
                value={inputStr}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className="text-text-secondary w-5 bg-transparent text-center text-sm outline-none"
              />
              <span className="text-text-secondary text-sm select-none">명</span>
            </div>
          ) : (
            <span className="text-text-secondary text-center text-sm">{displayValue}</span>
          )}
          <Button
            type="button"
            variant={isAtMax ? "solid" : "outlined"}
            colorScheme="secondary"
            size="xsmall"
            iconOnly
            leftIcon={<PlusIcon className="h-[13px] w-[13px]" />}
            onClick={handleIncrementClick}
            disabled={isAtMax}
            className="flex h-7 w-7 min-w-0 items-center justify-center rounded-xs p-0"
          />
        </div>
      </div>
    </div>
  );
}
