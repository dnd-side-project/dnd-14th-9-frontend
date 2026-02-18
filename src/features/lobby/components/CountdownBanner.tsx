"use client";

import { ClockIcon } from "@/components/Icon/ClockIcon";

import { useCountdown } from "../hooks/useCountdown";

interface CountdownBannerProps {
  targetTime?: Date;
}

const TEST_TARGET = new Date("2025-12-31T23:59:59");

export function CountdownBanner({ targetTime = TEST_TARGET }: CountdownBannerProps) {
  const { formatted, isExpired } = useCountdown(targetTime);

  return (
    <div className="bg-surface-strong px-md py-sm text-center">
      {isExpired ? (
        <p className="text-text-status-negative-default text-base font-semibold">
          세션이 곧 시작됩니다
        </p>
      ) : (
        <p className="text-base font-semibold text-gray-200">
          세션 시작까지{" "}
          <span className="text-text-status-negative-default inline-flex items-center gap-1 align-middle">
            <ClockIcon size="small" />
            {formatted}
          </span>
        </p>
      )}
    </div>
  );
}
