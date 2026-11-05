import { useState, useEffect, type ChangeEvent } from "react";

import { Button } from "@/components/Button/Button";
import { MinusIcon } from "@/components/Icon/MinusIcon";
import { PlusIcon } from "@/components/Icon/PlusIcon";
import { cn } from "@/lib/utils/utils";

// 모바일 32px / md 이상 28px 정사각 버튼
const STEP_BUTTON_CLASS =
  "flex size-8 md:size-7 min-w-0 items-center justify-center rounded-sm bg-surface-strong p-0";

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
    // p-md 같은 커스텀 토큰은 tailwind-merge가 p-0과 충돌로 보지 않아 호출부의 p-0이 무시된다. 값이 같은 p-4를 쓴다.
    <div className={cn("border-border-default shrink-0 rounded-sm border p-4", className)}>
      <div className="flex h-full flex-col gap-[20px]">
        {!hideHeader && (
          <div className="flex items-center justify-between gap-1">
            <span className="text-text-secondary shrink-0 text-base whitespace-nowrap">
              {label}
            </span>
            <span className="text-text-muted text-right text-[10px] break-keep">{hint}</span>
          </div>
        )}
        <div className="gap-2xs md:gap-xs flex items-center justify-center">
          <Button
            type="button"
            variant={isAtMin ? "solid" : "outlined"}
            colorScheme="secondary"
            size="xsmall"
            iconOnly
            leftIcon={<MinusIcon className="h-4 w-4 md:h-5 md:w-5" />}
            onClick={handleDecrementClick}
            disabled={isAtMin}
            className={STEP_BUTTON_CLASS}
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
            <span className="text-text-tertiary px-3 text-center text-[13px] break-keep md:w-16 md:text-lg md:font-semibold">
              {displayValue}
            </span>
          )}
          <Button
            type="button"
            variant={isAtMax ? "solid" : "outlined"}
            colorScheme="secondary"
            size="xsmall"
            iconOnly
            leftIcon={<PlusIcon size="small" className="h-4 w-4 md:h-5 md:w-5" />}
            onClick={handleIncrementClick}
            disabled={isAtMax}
            className={STEP_BUTTON_CLASS}
          />
        </div>
      </div>
    </div>
  );
}
