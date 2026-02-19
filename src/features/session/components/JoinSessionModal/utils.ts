import type { BadgeProps } from "@/components/Badge/Badge";

type SessionStatusDisplay = {
  text: string;
  badgeStatus: NonNullable<BadgeProps["status"]>;
};

/**
 * API에서 한글로 응답되는 세션 상태를 디스플레이용 텍스트와 Badge status로 변환
 */
export function getSessionStatusDisplay(status: string): SessionStatusDisplay {
  switch (status) {
    case "대기":
      return { text: "진행 전", badgeStatus: "recruiting" };
    case "진행중":
    case "진행 중":
      return { text: "진행 중", badgeStatus: "inProgress" };
    case "종료":
      return { text: "종료", badgeStatus: "closed" };
    default:
      return { text: status, badgeStatus: "recruiting" };
  }
}
