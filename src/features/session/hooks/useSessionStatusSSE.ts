"use client";

import { useState, useEffect, useRef, useCallback } from "react";

import { SSEClient } from "@/lib/sse/client";
import type { SSEConnectionStatus, SSEError } from "@/lib/sse/types";

import type { SessionStatusEventData } from "../types";

interface UseSessionStatusSSEOptions {
  sessionId: string;
  enabled?: boolean;
  onStatusChange?: (status: SessionStatusEventData) => void;
  onError?: (error: SSEError) => void;
}

interface UseSessionStatusSSEReturn {
  data: SessionStatusEventData | null;
  status: SSEConnectionStatus;
  error: SSEError | null;
  reconnect: () => void;
  disconnect: () => void;
}

const SSE_EVENT_NAME = "session-status-updated";

export function useSessionStatusSSE({
  sessionId,
  enabled = true,
  onStatusChange,
  onError,
}: UseSessionStatusSSEOptions): UseSessionStatusSSEReturn {
  const [data, setData] = useState<SessionStatusEventData | null>(null);
  const [status, setStatus] = useState<SSEConnectionStatus>("idle");
  const [error, setError] = useState<SSEError | null>(null);

  const clientRef = useRef<SSEClient | null>(null);
  const onStatusChangeRef = useRef(onStatusChange);
  const onErrorRef = useRef(onError);

  // 콜백 최신 참조 유지
  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const getSSEUrl = useCallback(() => {
    return `/api/sse/session-status/${sessionId}`;
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

    // 상태 변경 리스너 - 연결 시작 시 이전 에러 초기화
    const unsubscribeStatus = client.onStatusChange((newStatus) => {
      setStatus(newStatus);
      if (newStatus === "connecting") {
        setError(null);
      }
    });

    // 이벤트 리스너 등록
    const unsubscribeEvent = client.on<SessionStatusEventData>(SSE_EVENT_NAME, (eventData) => {
      setData(eventData);
      setError(null);
      onStatusChangeRef.current?.(eventData);
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
