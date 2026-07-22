import type { ReactNode } from "react";

import { Avatar } from "@/components/Avatar/Avatar";
import { cn } from "@/lib/utils/utils";

export interface ChatBubbleProps {
  /** 비어 있으면 말풍선을 그리지 않는다(퀵액션만 있는 메시지) */
  text: string;
  /** 버블 정렬. 아바타가 붙는 쪽도 이 값을 따른다(좌측 정렬=좌측 아바타). */
  align: "left" | "right";
  /** 아바타 노출 여부. 기본값은 align === "left"이며, 명시하면 정렬과 무관하게 덮어쓴다. */
  showAvatar?: boolean;
  /** 아바타 위에 방장 배지 노출 */
  isSenderHost?: boolean;
  avatarSrc?: string;
  senderNickname?: string;
  /** 말풍선 아래에 덧붙는 퀵액션 칩. 텍스트와 아바타 하나를 공유한다. */
  quickAction?: { icon: ReactNode; label: string };
  timestamp?: string;
}

export function ChatBubble({
  text,
  align,
  showAvatar = align === "left",
  isSenderHost = false,
  avatarSrc,
  senderNickname,
  quickAction,
  timestamp,
}: ChatBubbleProps) {
  const isRight = align === "right";

  return (
    <div className={cn("flex w-full items-start gap-2", isRight && "flex-row-reverse")}>
      {showAvatar && (
        <Avatar
          className="shrink-0"
          size="medium"
          type={avatarSrc ? "image" : "empty"}
          src={avatarSrc}
          alt={senderNickname ?? ""}
          showBadge={isSenderHost}
        />
      )}

      {/* 말풍선과 퀵액션 칩은 아바타 하나를 공유하며 세로로 쌓인다 */}
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col gap-2.5",
          isRight ? "items-end" : "items-start"
        )}
      >
        {text && (
          <div className={cn("flex max-w-full items-end gap-2", isRight && "flex-row-reverse")}>
            <div className="bg-surface-strong border-border-default text-text-primary rounded-md border px-4 py-3 text-base break-words">
              {text}
            </div>
            {timestamp && (
              <span className="text-surface-subtler shrink-0 text-[11px]">{timestamp}</span>
            )}
          </div>
        )}

        {quickAction && (
          <div className="bg-surface-subtle text-text-primary flex shrink-0 items-center gap-1 rounded-md py-2 pr-3 pl-2.5 text-[13px]">
            {quickAction.icon}
            {quickAction.label}
          </div>
        )}
      </div>
    </div>
  );
}
