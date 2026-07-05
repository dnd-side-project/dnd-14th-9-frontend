import type { ReactNode } from "react";

import { Avatar } from "@/components/Avatar/Avatar";
import { cn } from "@/lib/utils/utils";

export interface ChatBubbleProps {
  text: string;
  /** 버블 정렬. 아바타가 붙는 쪽도 이 값을 따른다(좌측 정렬=좌측 아바타). */
  align: "left" | "right";
  /** 아바타 노출 여부. 기본값은 align === "left"이며, 명시하면 정렬과 무관하게 덮어쓴다. */
  showAvatar?: boolean;
  /** 아바타 위에 방장 배지 노출 */
  isSenderHost?: boolean;
  avatarSrc?: string;
  senderNickname?: string;
  /** QUICK_ACTION 메시지일 때 텍스트 대신 노출할 아이콘 + 라벨 */
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
    <div className={cn("flex w-full items-end gap-2", isRight && "flex-row-reverse")}>
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

      {quickAction ? (
        <div className="bg-surface-subtle text-text-primary flex shrink-0 items-center gap-1 rounded-md py-2 pr-3 pl-2.5 text-[13px]">
          {quickAction.icon}
          {quickAction.label}
        </div>
      ) : (
        <div className="bg-surface-strong border-border-default text-text-primary max-w-[70%] rounded-md border px-3 py-2 text-sm break-words">
          {text}
        </div>
      )}
      {timestamp && <span className="text-text-disabled shrink-0 text-[11px]">{timestamp}</span>}
    </div>
  );
}
