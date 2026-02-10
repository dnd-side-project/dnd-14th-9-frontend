import { cva, type VariantProps } from "class-variance-authority";
import {
  forwardRef,
  useState,
  useCallback,
  useId,
  type InputHTMLAttributes,
  type FocusEvent,
  type ChangeEvent,
} from "react";

import { cn } from "@/lib/utils/utils";
import { ClearIcon } from "../Icon/ClearIcon";

const inputVariants = cva(
  [
    "w-full",
    "max-w-95",
    "h-14",
    "px-md",
    "rounded-sm",
    "border",
    "text-base",
    "font-pretendard",
    "transition-all",
    "outline-none",
    "placeholder:text-text-muted",
  ],
  {
    variants: {
      state: {
        default: [
          "border-border-subtle",
          "bg-transparent",
          "text-text-tertiary",
          "focus:border-text-brand-default",
          "focus:shadow-[0_0_8px_rgba(34,197,94,0.5)]",
        ],
        filled: [
          "border-border-strong",
          "bg-transparent",
          "text-text-tertiary",
          "focus:border-text-brand-default",
          "focus:shadow-[0_0_8px_rgba(34,197,94,0.5)]",
        ],
        error: [
          "border-border-error-default",
          "bg-transparent",
          "text-text-status-negative-default",
        ],
        disabled: [
          "border-border-subtle",
          "bg-surface-disabled",
          "text-text-disabled",
          "placeholder:text-text-disabled",
          "cursor-not-allowed",
        ],
      },
    },
    defaultVariants: {
      state: "default",
    },
  }
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">, VariantProps<typeof inputVariants> {
  label?: string;
  error?: boolean;
  errorMessage?: string;
  onClear?: () => void;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      label,
      error = false,
      errorMessage,
      disabled = false,
      value,
      defaultValue,
      onClear,
      onFocus,
      onBlur,
      onChange,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorMessageId = `${inputId}-error`;

    const [internalValue, setInternalValue] = useState(defaultValue ?? "");

    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;
    const hasValue = String(currentValue).length > 0;

    const getState = () => {
      if (disabled) return "disabled";
      if (error) return "error";
      if (hasValue) return "filled";
      return "default";
    };

    const handleFocus = useCallback(
      (e: FocusEvent<HTMLInputElement>) => {
        onFocus?.(e);
      },
      [onFocus]
    );

    const handleBlur = useCallback(
      (e: FocusEvent<HTMLInputElement>) => {
        onBlur?.(e);
      },
      [onBlur]
    );

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        if (!isControlled) {
          setInternalValue(e.target.value);
        }
        onChange?.(e);
      },
      [isControlled, onChange]
    );

    const handleClear = useCallback(() => {
      if (!isControlled) {
        setInternalValue("");
      }
      onClear?.();
    }, [isControlled, onClear]);

    const showClearButton = hasValue && !disabled && !error;

    return (
      <div className={cn("flex w-full max-w-95 flex-col gap-2", containerClassName)}>
        {label && (
          <label htmlFor={inputId} className="text-text-secondary text-base">
            {label}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={cn(
              inputVariants({ state: getState() }),
              showClearButton && "pr-12",
              className
            )}
            disabled={disabled}
            value={currentValue}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            aria-invalid={error}
            aria-describedby={error && errorMessage ? errorMessageId : undefined}
            {...props}
          />

          {showClearButton && (
            <button
              type="button"
              className="right-md absolute top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleClear}
              tabIndex={-1}
              aria-label="입력 초기화"
            >
              <ClearIcon size="small" />
            </button>
          )}
        </div>

        {error && errorMessage && (
          <span id={errorMessageId} className="text-text-status-negative-default text-sm">
            {errorMessage}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { inputVariants };
