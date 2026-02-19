"use client";

import { useState, useEffect, useRef, useCallback } from "react";

import { SSEClient } from "@/lib/sse/client";
import type { SSEConnectionStatus, SSEError } from "@/lib/sse/types";

import type { WaitingMembersEventData } from "../types";

/**
 * 대기방 참여자 목록을 SSE로 실시간 수신하는 훅
 *
 * @example
 * ```tsx
 * function ParticipantList({ sessionId }: { sessionId: string }) {
 *   const { data, status, error, reconnect } = useWaitingMembersSSE({
 *     sessionId,
 *     enabled: true,
 *     onError: (err) => console.error("SSE 에러:", err),
 *   });
 *
 *   if (status === "connecting") return <div>연결 중...</div>;
 *   if (error) return <button onClick={reconnect}>재연결</button>;
 *
 *   return (
 *     <ul>
 *       {data?.members.map((member) => (
 *         <li key={member.memberId}>{member.nickname}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
interface UseWaitingMembersSSEOptions {
  sessionId: string;
  enabled?: boolean;
  onError?: (error: SSEError) => void;
}

interface UseWaitingMembersSSEReturn {
  data: WaitingMembersEventData | null;
  status: SSEConnectionStatus;
  error: SSEError | null;
  reconnect: () => void;
  disconnect: () => void;
}

const SSE_EVENT_NAME = "waiting-members-updated";

export function useWaitingMembersSSE({
  sessionId,
  enabled = true,
  onError,
}: UseWaitingMembersSSEOptions): UseWaitingMembersSSEReturn {
  const [data, setData] = useState<WaitingMembersEventData | null>(null);
  const [status, setStatus] = useState<SSEConnectionStatus>("idle");
  const [error, setError] = useState<SSEError | null>(null);

  const clientRef = useRef<SSEClient | null>(null);
  const onErrorRef = useRef(onError);

  // onError 콜백 최신 참조 유지
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const getSSEUrl = useCallback(() => {
    return `/api/sse/waiting/${sessionId}`;
  }, [sessionId]);

  const connect = useCallback(() => {
    if (!clientRef.current) return;

    setError(null);
    clientRef.current.connect(getSSEUrl());
  }, [getSSEUrl]);

  const disconnect = useCallback(() => {
    clientRef.current?.disconnect();
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    connect();
  }, [disconnect, connect]);

  useEffect(() => {
    if (!enabled || !sessionId) return;

    // SSE 클라이언트 생성
    const client = new SSEClient();
    clientRef.current = client;

    // 상태 변경 리스너
    const unsubscribeStatus = client.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    // 이벤트 리스너 등록
    const unsubscribeEvent = client.on<WaitingMembersEventData>(SSE_EVENT_NAME, (eventData) => {
      setData(eventData);
      setError(null);
    });

    // 에러 리스너
    const unsubscribeError = client.on<SSEError>("error", (sseError) => {
      setError(sseError);
      onErrorRef.current?.(sseError);
    });

    // 연결 시작
    client.connect(getSSEUrl());

    // cleanup
    return () => {
      unsubscribeStatus();
      unsubscribeEvent();
      unsubscribeError();
      client.disconnect();
      clientRef.current = null;
    };
  }, [sessionId, enabled, getSSEUrl]);

  return {
    data,
    status,
    error,
    reconnect,
    disconnect,
  };
}
