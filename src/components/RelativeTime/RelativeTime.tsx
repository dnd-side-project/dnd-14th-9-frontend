"use client";

import { useEffect, useState } from "react";

import { formatRelativeTime } from "@/lib/utils/date";

interface RelativeTimeProps {
  date: Date | string;
  /** 클라이언트 hydration 전 표시할 텍스트 (기본값: null) */
  fallback?: string | null;
}

/**
 * 상대 시간을 표시하는 컴포넌트
 *
 * SSR/Hydration 시 mismatch를 방지하기 위해
 * 클라이언트에서만 상대 시간을 계산합니다.
 */
export function RelativeTime({ date, fallback = null }: RelativeTimeProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 감지를 위한 의도적 패턴
    setMounted(true);
  }, []);

  if (!mounted) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{formatRelativeTime(date)}</>;
}
