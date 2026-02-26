import {
  forwardRef,
  useState,
  useCallback,
  useId,
  type InputHTMLAttributes,
  type FocusEvent,
  type ChangeEvent,
} from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/utils";

import { ClearIcon } from "../Icon/ClearIcon";

import { HelperText, type HelperTextType } from "./HelperText";

const textInputVariants = cva(
  [
    "w-full",
    "rounded-sm",
    "border",
    "text-base",
    "font-pretendard",
    "transition-[border-color,box-shadow]",
    "outline-none",
    "placeholder:text-text-muted",
    "bg-surface-strong",
  ],
  {
    variants: {
      state: {
        default: [
          "border-border-subtle",
          "text-text-primary",
          "focus:border-text-brand-default",
          "focus:shadow-[0_0_8px_rgba(34,197,94,0.5)]",
        ],
        filled: [
          "border-border-subtle",
          "text-text-primary",
          "focus:border-text-brand-default",
          "focus:shadow-[0_0_8px_rgba(34,197,94,0.5)]",
        ],
        error: [
          "border-border-error-default",
          "text-text-primary",
          "focus:shadow-[0_0_8px_rgba(239,68,68,0.5)]",
        ],
        disabled: [
          "border-border-disabled",
          "bg-surface-disabled",
          "text-text-disabled",
          "placeholder:text-text-disabled",
          "cursor-not-allowed",
        ],
      },
      size: {
        md: "h-[56px] px-md",
        sm: "h-[44px] px-md",
      },
    },
    defaultVariants: {
      state: "default",
      size: "md",
    },
  }
);

export interface TextInputProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof textInputVariants> {
  label?: string;
  error?: boolean;
  errorMessage?: string;
  helperText?: string;
  helperTextType?: HelperTextType;
  onClear?: () => void;
  containerClassName?: string;
  fullWidth?: boolean;
  showCharacterCount?: boolean;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      className,
      containerClassName,
      fullWidth = false,
      label,
      error = false,
      errorMessage,
      helperText,
      helperTextType = "default",
      disabled = false,
      value,
      defaultValue,
      size = "md",
      onClear,
      onFocus,
      onBlur,
      onChange,
      showCharacterCount = false,
      maxLength,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorMessageId = `${inputId}-error`;

    const [internalValue, setInternalValue] = useState(defaultValue ?? "");
    const [isFocused, setIsFocused] = useState(false);

    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;
    const characterCount = String(currentValue).length;
    const hasValue = characterCount > 0;
    const showCount = showCharacterCount && maxLength !== undefined;

    const getState = () => {
      if (disabled) return "disabled";
      if (error) return "error";
      if (hasValue) return "filled";
      return "default";
    };

    const handleFocus = useCallback(
      (e: FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        onFocus?.(e);
      },
      [onFocus]
    );

    const handleBlur = useCallback(
      (e: FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
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

    const showClearButton = hasValue && isFocused && !disabled && !error;

    return (
      <div
        className={cn("flex w-full flex-col gap-2", !fullWidth && "max-w-95", containerClassName)}
      >
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
              textInputVariants({ state: getState(), size }),
              showClearButton && "pr-12",
              className
            )}
            disabled={disabled}
            value={currentValue}
            maxLength={maxLength}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            aria-invalid={error}
            aria-describedby={error && errorMessage ? errorMessageId : undefined}
            {...(props as Omit<InputHTMLAttributes<HTMLInputElement>, "size">)}
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

        {showCount && (
          <div className="flex w-full justify-end">
            <span
              className={cn(
                "text-sm",
                error ? "text-text-status-negative-default" : "text-text-muted"
              )}
              aria-live="polite"
            >
              {characterCount}/{maxLength}
            </span>
          </div>
        )}

        {/* Priority: errorMessage > helperText */}
        {error && errorMessage ? (
          <HelperText id={errorMessageId} text={errorMessage} type="negative" />
        ) : helperText ? (
          <HelperText text={helperText} type={helperTextType} />
        ) : null}
      </div>
    );
  }
);

TextInput.displayName = "TextInput";

export { textInputVariants };
