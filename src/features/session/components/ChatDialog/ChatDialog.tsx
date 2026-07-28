"use client";

import { useRef } from "react";

import { CloseIcon } from "@/components/Icon/CloseIcon";
import { Portal } from "@/components/Portal/Portal";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

import { ChatMessageInput } from "./ChatMessageInput";
import { ChatMessageList } from "./ChatMessageList";
import { ChatQuickActionBar } from "./ChatQuickActionBar";
import { ChatSessionInfo } from "./ChatSessionInfo";

import type { useSessionChat } from "./useSessionChat";
import type { InProgressMember } from "../../types";

interface ChatDialogProps {
  isHost: boolean;
  myMemberId?: number;
  category: string;
  title: string;
  description: string;
  notice: string;
  participantCount: number;
  members: InProgressMember[];
  /** 카드 레벨에서 소유하는 채팅 상태 — 다이얼로그를 닫아도 수신 기록이 유지된다 */
  chat: ReturnType<typeof useSessionChat>;
  onClose: () => void;
}

export function ChatDialog({
  isHost,
  myMemberId,
  category,
  title,
  description,
  notice,
  participantCount,
  members,
  chat,
  onClose,
}: ChatDialogProps) {
  useBodyScrollLock();

  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const {
    messages,
    status,
    inputValue,
    setInputValue,
    selectedQuickAction,
    selectQuickAction,
    sendMessage,
  } = chat;

  // 메시지 영역 전체를 덮는 중앙 안내 문구. 재연결 중에는 null — 쌓인 메시지를 유지한다
  const centerNotice =
    status === "disconnected"
      ? "연결할 수 없어요"
      : status !== "connected" && messages.length === 0
        ? "연결 중이에요"
        : null;

  const setDialogRef = (node: HTMLDialogElement | null) => {
    if (node && !node.open) {
      node.showModal();
    }
    dialogRef.current = node;
  };

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target !== dialogRef.current) return;
    onClose();
  };

  return (
    <Portal>
      <dialog
        ref={setDialogRef}
        onCancel={onClose}
        onClick={handleBackdropClick}
        aria-label={`${title} 채팅`}
        className="bg-surface-default fixed inset-0 m-auto flex h-[min(720px,85vh)] w-full max-w-[590px] flex-col rounded-lg border border-gray-900 backdrop:bg-(--color-overlay-default) max-md:w-[calc(100%-2rem)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="채팅 닫기"
          className="text-text-muted hover:text-text-primary absolute top-5 right-5 cursor-pointer p-1 transition-colors"
        >
          <CloseIcon size="medium" />
        </button>

        {/* 패딩은 dialog가 아닌 이 래퍼에 둔다 — dialog에 패딩이 있으면 그 여백 클릭 시
            event.target이 dialog가 되어 배경 클릭으로 오인, 모달이 닫힌다. */}
        <div className="p-3xl max-md:p-xl flex min-h-0 flex-1 flex-col gap-5">
          <ChatSessionInfo
            category={category}
            title={title}
            description={description}
            notice={notice}
            participantCount={participantCount}
          />

          {centerNotice ? (
            <div className="text-text-secondary flex flex-1 items-center justify-center text-sm">
              {centerNotice}
            </div>
          ) : (
            <>
              {status !== "connected" && (
                <p className="text-text-secondary py-1 text-center text-sm">다시 연결 중이에요</p>
              )}
              <ChatMessageList messages={messages} members={members} myMemberId={myMemberId} />
            </>
          )}

          <div className="flex flex-col gap-3">
            {isHost && (
              <ChatQuickActionBar selected={selectedQuickAction} onSelect={selectQuickAction} />
            )}
            <ChatMessageInput
              value={inputValue}
              onChange={setInputValue}
              onSend={sendMessage}
              disabled={!isHost || status !== "connected"}
              readOnly={selectedQuickAction !== null}
            />
          </div>
        </div>
      </dialog>
    </Portal>
  );
}
