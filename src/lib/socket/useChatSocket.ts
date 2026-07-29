"use client";

import { useEffect, useRef, useState } from "react";

import { createChatSocket, type ChatSocket } from "./client";

import type { ChatError, ChatReceivedMessage, ChatSendPayload, ConnectionStatus } from "./types";

interface UseChatSocketOptions {
  sessionId: string;
  onMessage?: (message: ChatReceivedMessage) => void;
  onError?: (error: ChatError) => void;
}

interface UseChatSocketReturn {
  status: ConnectionStatus;
  send: (payload: ChatSendPayload) => void;
}

/**
 * 세션 채팅 WebSocket(STOMP) 연결을 관리하는 훅
 *
 * 마운트 시 /api/chat/ws-token으로 accessToken을 받아와 연결하고,
 * 언마운트 시 연결을 해제한다.
 */
export function useChatSocket({
  sessionId,
  onMessage,
  onError,
}: UseChatSocketOptions): UseChatSocketReturn {
  const [status, setStatus] = useState<ConnectionStatus>("idle");

  const socketRef = useRef<ChatSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;
    const socket = createChatSocket();
    socketRef.current = socket;

    const unsubscribeStatus = socket.on("status", setStatus);
    const unsubscribeMessage = socket.on("message", (message) => onMessageRef.current?.(message));
    const unsubscribeError = socket.on("error", (chatError) => onErrorRef.current?.(chatError));

    // 토큰 응답이 안 오면(병적 stall) status가 idle에 멈춰 죽은 화면이 되므로 타임아웃을
    // 건다. 같은 controller로 언마운트 시 진행 중인 요청도 취소한다.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    fetch("/api/chat/ws-token", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch ws token");
        return response.json() as Promise<{ accessToken: string }>;
      })
      .then(({ accessToken }) => {
        if (cancelled) return;
        socket.connect(sessionId, accessToken);
      })
      .catch(() => {
        if (!cancelled) setStatus("disconnected");
      })
      .finally(() => clearTimeout(timeoutId));

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeoutId);
      unsubscribeStatus();
      unsubscribeMessage();
      unsubscribeError();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [sessionId]);

  const send = (payload: ChatSendPayload) => {
    socketRef.current?.send(payload);
  };

  return { status, send };
}
