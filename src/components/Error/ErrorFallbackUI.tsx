"use client";

import { Button } from "@/components/Button/Button";
import { AlertIcon } from "@/components/Icon/AlertIcon";

type ErrorFallbackUIBaseProps = {
  title: string;
  description: string;
  buttonLabel: string;
  className?: string; // 컨테이너에 전달할 추가 클래스 (예: 상단 패딩용)
};

type ErrorFallbackUIRetryProps = ErrorFallbackUIBaseProps & {
  onRetry: () => void;
  href?: never;
};

type ErrorFallbackUILinkProps = ErrorFallbackUIBaseProps & {
  href: string;
  onRetry?: never;
};

export type ErrorFallbackUIProps = ErrorFallbackUIRetryProps | ErrorFallbackUILinkProps;

export function ErrorFallbackUI({
  title,
  description,
  buttonLabel,
  onRetry,
  href,
  className = "",
}: ErrorFallbackUIProps) {
  return (
    <div className={`flex w-full flex-col items-center justify-center gap-8 ${className}`}>
      <div className="flex w-full shrink-0 flex-col items-center">
        <div className="flex w-full shrink-0 items-center justify-center px-16 py-5">
          <div className="relative size-[120px] shrink-0">
            <AlertIcon className="text-text-primary h-[120px] w-[120px]" />
          </div>
        </div>
        <p className="text-text-primary text-center text-[44px] font-bold tracking-[-0.44px]">
          {title}
        </p>
      </div>

      <div className="font-regular text-text-muted min-w-full shrink-0 text-center text-[18px] leading-[1.4] whitespace-pre-wrap">
        {description}
      </div>

      {href !== undefined ? (
        <Button href={href} variant="solid" colorScheme="tertiary" size="large">
          {buttonLabel}
        </Button>
      ) : (
        <Button onClick={onRetry} variant="solid" colorScheme="tertiary" size="large">
          {buttonLabel}
        </Button>
      )}
    </div>
  );
}
