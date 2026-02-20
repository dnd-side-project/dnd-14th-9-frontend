"use client";

import { useState } from "react";

import { Button } from "@/components/Button/Button";
import { CloseIcon } from "@/components/Icon/CloseIcon";
import { Input } from "@/components/Input/Input";

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isMe: boolean;
}

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    sender: "김민수",
    content: "안녕하세요! 오늘 세션 기대되네요",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    isMe: false,
  },
  {
    id: "2",
    sender: "나",
    content: "안녕하세요~ 저도 기대됩니다!",
    timestamp: new Date(Date.now() - 1000 * 60 * 4),
    isMe: true,
  },
  {
    id: "3",
    sender: "이서연",
    content: "다들 화이팅이요!",
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    isMe: false,
  },
];

interface ChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatPopup({ isOpen, onClose }: ChatPopupProps) {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage: ChatMessage = {
      id: String(Date.now()),
      sender: "나",
      content: inputValue.trim(),
      timestamp: new Date(),
      isMe: true,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    // TODO: API 호출로 메시지 전송
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-6 bottom-6 z-50 flex h-[500px] w-[360px] flex-col overflow-hidden rounded-2xl bg-gray-900 shadow-2xl">
      {/* 헤더 */}
      <div className="border-border-subtle flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-text-primary text-[18px] font-bold">채팅</h3>
        <button
          type="button"
          className="text-text-muted hover:text-text-primary cursor-pointer p-1 transition-colors"
          onClick={onClose}
          aria-label="채팅 닫기"
        >
          <CloseIcon size="medium" />
        </button>
      </div>

      {/* 메시지 영역 */}
      <div className="scrollbar-hide flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col gap-1 ${message.isMe ? "items-end" : "items-start"}`}
          >
            {!message.isMe && (
              <span className="text-text-secondary text-[12px]">{message.sender}</span>
            )}
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-[14px] ${
                message.isMe
                  ? "text-common-white bg-green-600"
                  : "bg-surface-strong text-text-primary"
              }`}
            >
              {message.content}
            </div>
            <span className="text-text-disabled text-[11px]">{formatTime(message.timestamp)}</span>
          </div>
        ))}
      </div>

      {/* 입력 영역 */}
      <div className="border-border-subtle flex gap-2 border-t p-3">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요"
          fullWidth
          containerClassName="flex-1"
        />
        <Button variant="solid" colorScheme="primary" size="medium" onClick={handleSend}>
          전송
        </Button>
      </div>
    </div>
  );
}
