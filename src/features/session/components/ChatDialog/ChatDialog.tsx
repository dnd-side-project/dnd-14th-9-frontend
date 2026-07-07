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
        className="bg-surface-default p-3xl max-md:p-xl fixed inset-0 m-auto flex h-[min(720px,85vh)] w-full max-w-[590px] flex-col gap-5 rounded-lg border border-gray-900 backdrop:bg-(--color-overlay-default) max-md:w-[calc(100%-2rem)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="채팅 닫기"
          className="text-text-muted hover:text-text-primary absolute top-5 right-5 cursor-pointer p-1 transition-colors"
        >
          <CloseIcon size="medium" />
        </button>

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
            disabled={!isHost}
          />
        </div>
      </dialog>
    </Portal>
  );
}
