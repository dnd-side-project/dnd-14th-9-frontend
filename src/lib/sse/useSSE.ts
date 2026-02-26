"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { SSEClient } from "./client";

import type { SSEConnectionStatus, SSEError } from "./types";

interface UseSSEOptions<T> {
  url: string;
  eventName: string;
  enabled?: boolean;
  onData?: (data: T) => void;
  onError?: (error: SSEError) => void;
}

interface UseSSEReturn<T> {
  data: T | null;
  status: SSEConnectionStatus;
  error: SSEError | null;
  reconnect: () => void;
  disconnect: () => void;
}

/**
 * SSE 이벤트를 구독하는 제네릭 훅
 *
 * 모든 SSE 훅이 공유하는 공통 로직(연결/해제/재연결, 상태 관리, 에러 처리)을 캡슐화합니다.
 */
export function useSSE<T>({
  url,
  eventName,
  enabled = true,
  onData,
  onError,
}: UseSSEOptions<T>): UseSSEReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<SSEConnectionStatus>("idle");
  const [error, setError] = useState<SSEError | null>(null);

  const clientRef = useRef<SSEClient | null>(null);
  const onDataRef = useRef(onData);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onDataRef.current = onData;
  }, [onData]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const connect = useCallback(() => {
    if (!clientRef.current) return;

    setError(null);
    clientRef.current.connect(url);
  }, [url]);

  const disconnect = useCallback(() => {
    clientRef.current?.disconnect();
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    connect();
  }, [disconnect, connect]);

  useEffect(() => {
    if (!enabled) return;

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
    const unsubscribeEvent = client.on<T>(eventName, (eventData) => {
      setData(eventData);
      setError(null);
      onDataRef.current?.(eventData);
    });

    // 에러 리스너
    const unsubscribeError = client.on<SSEError>("error", (sseError) => {
      setError(sseError);
      onErrorRef.current?.(sseError);
    });

    // 연결 시작
    client.connect(url);

    // cleanup
    return () => {
      unsubscribeStatus();
      unsubscribeEvent();
      unsubscribeError();
      client.disconnect();
      clientRef.current = null;
    };
  }, [url, eventName, enabled]);

  return {
    data,
    status,
    error,
    reconnect,
    disconnect,
  };
}
