import {
  useState,
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
          "focus:shadow-[0_0_16px_0]",
          "focus:shadow-text-brand-default/30",
        ],
        filled: [
          "border-border-default",
          "text-text-primary",
          "focus:border-text-brand-default",
          "focus:shadow-[0_0_16px_0]",
          "focus:shadow-text-brand-default/30",
        ],
        error: [
          "border-border-error-default",
          "text-text-status-negative-default",
          "placeholder:text-text-status-negative-default",
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
        md: "h-11 px-sm text-[13px] md:h-14 md:px-md md:text-base",
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
  ref?: React.Ref<HTMLInputElement>;
}

export function TextInput({
  className,
  containerClassName,
  fullWidth = false,
  label,
  required = false,
  error = false,
  errorMessage,
  helperText,
  helperTextType = "default",
  disabled = false,
  readOnly = false,
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
  ref,
  ...props
}: TextInputProps) {
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

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalValue(e.target.value);
    }
    onChange?.(e);
  };

  const handleClear = () => {
    if (!isControlled) {
      setInternalValue("");
    }
    onClear?.();
  };

  const showClearButton = hasValue && isFocused && !disabled && !readOnly && !error;

  return (
    <div className={cn("flex w-full flex-col gap-2", !fullWidth && "max-w-95", containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-text-secondary text-xs font-semibold md:text-base">
          {label}
          {required && (
            <span className="text-text-status-negative-default ml-1" aria-hidden="true">
              *
            </span>
          )}
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
          readOnly={readOnly}
          value={currentValue}
          maxLength={maxLength}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          aria-invalid={error}
          aria-required={required || undefined}
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
        <div className="flex w-full">
          <span className="text-text-disabled text-[11px] md:text-xs" aria-live="polite">
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

export { textInputVariants };
