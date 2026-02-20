"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/Badge/Badge";
import { formatRelativeTime } from "@/lib/utils/date";

interface RelativeTimeBadgeProps {
  date: Date | string;
}

/**
 * 상대 시간 뱃지 컴포넌트
 *
 * SSR/Hydration 시 mismatch를 방지하기 위해
 * 클라이언트에서만 상대 시간을 계산하여 Badge로 표시합니다.
 */
export function RelativeTimeBadge({ date }: RelativeTimeBadgeProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 감지를 위한 의도적 패턴
    setMounted(true);
  }, []);

  if (!mounted) {
    // 서버/hydration 시에는 빈 뱃지 렌더링 (레이아웃 shift 최소화)
    return (
      <Badge radius="max" status="recruiting" className="invisible">
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      </Badge>
    );
  }

  const relativeTime = formatRelativeTime(date);
  const isClosing = relativeTime === "마감임박" || relativeTime === "마감 임박";
  const displayText = isClosing ? "마감임박" : relativeTime;
  const badgeStatus = isClosing ? "closing" : "recruiting";

  return (
    <Badge radius="max" status={badgeStatus}>
      {displayText}
    </Badge>
  );
}
