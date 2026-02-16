import {
  forwardRef,
  useState,
  useCallback,
  useId,
  type TextareaHTMLAttributes,
  type FocusEvent,
  type ChangeEvent,
} from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/utils";

const SIZE_STYLES = {
  medium: { minHeight: "98px" },
  small: { minHeight: "87px" },
} as const;

const textareaVariants = cva(
  [
    "w-full",
    "max-w-90",
    "p-xs",
    "rounded-sm",
    "border",
    "text-base",
    "font-pretendard",
    "transition-all",
    "outline-none",
    "placeholder:text-text-muted",
    "bg-surface-strong",
    "resize-y",
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
          "border-border-strong",
          "text-text-primary",
          "focus:border-text-brand-default",
          "focus:shadow-[0_0_8px_rgba(34,197,94,0.5)]",
        ],
        error: ["border-border-error-default", "text-text-status-negative-default"],
        disabled: [
          "bg-surface-disabled",
          "border-border-disabled",
          "text-text-disabled",
          "placeholder:text-text-disabled",
          "cursor-not-allowed",
          "resize-none",
        ],
      },
    },
    defaultVariants: {
      state: "default",
    },
  }
);

export interface TextareaProps
  extends
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
    VariantProps<typeof textareaVariants> {
  label?: string;
  error?: boolean;
  errorMessage?: string;
  showCharacterCount?: boolean;
  containerClassName?: string;
  size?: keyof typeof SIZE_STYLES;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
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
      size = "medium",
      showCharacterCount = false,
      maxLength,
      onFocus,
      onBlur,
      onChange,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const errorMessageId = `${textareaId}-error`;

    const [internalValue, setInternalValue] = useState(defaultValue ?? "");

    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;
    const characterCount = String(currentValue).length;
    const hasValue = characterCount > 0;

    const getState = () => {
      if (disabled) return "disabled";
      if (error) return "error";
      if (hasValue) return "filled";
      return "default";
    };

    const handleFocus = useCallback(
      (e: FocusEvent<HTMLTextAreaElement>) => {
        onFocus?.(e);
      },
      [onFocus]
    );

    const handleBlur = useCallback(
      (e: FocusEvent<HTMLTextAreaElement>) => {
        onBlur?.(e);
      },
      [onBlur]
    );

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLTextAreaElement>) => {
        if (!isControlled) {
          setInternalValue(e.target.value);
        }
        onChange?.(e);
      },
      [isControlled, onChange]
    );

    const showCount = showCharacterCount && maxLength !== undefined;

    return (
      <div className={cn("flex w-full max-w-90 flex-col gap-2", containerClassName)}>
        {label && (
          <label htmlFor={textareaId} className="text-text-secondary text-base">
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          className={cn(textareaVariants({ state: getState() }), className)}
          style={SIZE_STYLES[size]}
          disabled={disabled}
          value={currentValue}
          maxLength={maxLength}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          aria-invalid={error}
          aria-describedby={error && errorMessage ? errorMessageId : undefined}
          {...props}
        />

        {showCount && (
          <span
            className={cn(
              "text-sm",
              error ? "text-text-status-negative-default" : "text-text-muted"
            )}
            aria-live="polite"
          >
            {characterCount}/{maxLength}
          </span>
        )}

        {error && errorMessage && (
          <span id={errorMessageId} className="text-text-status-negative-default text-sm">
            {errorMessage}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
