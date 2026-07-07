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
 * 채팅 다이얼로그의 상태(수신 메시지 누적, 입력값, 퀵액션 스테이징)와
 * 전송 로직을 캡슐화한다. UI는 ChatDialog가 담당.
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

    if (!isDeselect) {
      // TODO: 디자이너가 퀵액션별 지정 문구를 확정하면 quickActionConfig의 message를
      // 채운다. 현재는 전부 미정(undefined)이라 자동 입력이 동작하지 않는다.
      const designatedMessage = QUICK_ACTION_CONFIG[type].message;
      if (designatedMessage !== undefined) {
        setInputValue(designatedMessage);
      }
    }
  };

  // 백엔드 계약상 한 메시지는 TEXT 또는 QUICK_ACTION 중 하나이므로,
  // 텍스트+퀵액션 동시 전송은 두 메시지를 순차 발행한다.
  const sendMessage = () => {
    const content = inputValue.trim();
    if (!content && !selectedQuickAction) return;

    if (content) {
      send({ type: "TEXT", content });
    }
    if (selectedQuickAction) {
      send({ type: "QUICK_ACTION", quickActionType: selectedQuickAction });
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
