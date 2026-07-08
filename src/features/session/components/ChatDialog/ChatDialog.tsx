"use client";

import { useRef } from "react";

import { CloseIcon } from "@/components/Icon/CloseIcon";
import { Portal } from "@/components/Portal/Portal";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

import { ChatMessageInput } from "./ChatMessageInput";
import { ChatMessageList } from "./ChatMessageList";
import { ChatQuickActionBar } from "./ChatQuickActionBar";
import { ChatSessionInfo } from "./ChatSessionInfo";
import { useSessionChat } from "./useSessionChat";

import type { InProgressMember } from "../../types";

interface ChatDialogProps {
  sessionId: string;
  isHost: boolean;
  myMemberId?: number;
  category: string;
  title: string;
  description: string;
  notice: string;
  participantCount: number;
  members: InProgressMember[];
  onClose: () => void;
}

export function ChatDialog({
  sessionId,
  isHost,
  myMemberId,
  category,
  title,
  description,
  notice,
  participantCount,
  members,
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
  } = useSessionChat(sessionId);

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

          {status === "disconnected" ? (
            <div className="text-text-secondary flex flex-1 items-center justify-center text-sm">
              연결할 수 없어요
            </div>
          ) : (
            <ChatMessageList messages={messages} members={members} myMemberId={myMemberId} />
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
            />
          </div>
        </div>
      </dialog>
    </Portal>
  );
}
