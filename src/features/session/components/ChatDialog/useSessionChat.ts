"use client";

import { useRef, useState } from "react";

import type { ChatReceivedMessage, QuickActionType } from "@/lib/socket/types";
import { useChatSocket } from "@/lib/socket/useChatSocket";
import { toast } from "@/lib/toast";

import { QUICK_ACTION_CONFIG } from "./quickActionConfig";

export interface ChatMessage extends ChatReceivedMessage {
  id: number;
  receivedAt: Date;
}

/**
 * 세션 채팅의 상태(수신 메시지 누적, 입력값, 퀵액션 스테이징)와 전송 로직을
 * 캡슐화한다. UI는 ChatDialog가 담당.
 *
 * 세션 페이지에 머무는 동안 유지되는 컴포넌트(참여자 카드)에서 호출해야 한다 —
 * 다이얼로그 내부에서 호출하면 닫을 때마다 연결과 수신 기록이 함께 사라진다.
 */
export function useSessionChat(sessionId: string) {
  const messageIdRef = useRef(0);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedQuickAction, setSelectedQuickAction] = useState<QuickActionType | null>(null);

  const { status, send } = useChatSocket({
    sessionId,
    onMessage: (message) => {
      messageIdRef.current += 1;
      setMessages((prev) => [
        ...prev,
        { ...message, id: messageIdRef.current, receivedAt: new Date() },
      ]);
    },
    onError: (chatError) => toast.error(chatError.message),
  });

  const selectQuickAction = (type: QuickActionType) => {
    const isDeselect = selectedQuickAction === type;
    setSelectedQuickAction(isDeselect ? null : type);
    // 선택 중에는 입력창이 지정 문구로 잠기므로(readOnly), 해제할 때 입력값도
    // 함께 비워야 문구가 일반 TEXT로 남아 전송되는 상태가 생기지 않는다
    setInputValue(isDeselect ? "" : QUICK_ACTION_CONFIG[type].message);
  };

  // 퀵액션 선택 시 지정 문구(content)와 quickActionType을 한 메시지에 담아 보낸다
  // (백엔드 합의: 2026-07-23, 퀵액션 버튼 → 입력창 자동 문구 → 함께 전송하는 디자인)
  const sendMessage = () => {
    const content = inputValue.trim();
    if (!content && !selectedQuickAction) return;

    if (selectedQuickAction) {
      send({
        type: "QUICK_ACTION",
        quickActionType: selectedQuickAction,
        content,
      });
    } else {
      send({ type: "TEXT", content });
    }

    setInputValue("");
    setSelectedQuickAction(null);
  };

  return {
    messages,
    status,
    inputValue,
    setInputValue,
    selectedQuickAction,
    selectQuickAction,
    sendMessage,
  };
}
