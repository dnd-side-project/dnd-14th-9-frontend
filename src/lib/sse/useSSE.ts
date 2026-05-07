"use client";

import { useEffect, useRef, useState } from "react";

import { SSEClient } from "./client";

import type { SSEConnectionStatus, SSEError } from "./types";

export interface SSEEventMeta {
  /** 이벤트 리스너가 등록된 시점의 url (in-flight 이벤트 race 검증용) */
  url: string;
}

interface UseSSEOptions<T> {
  url: string;
  eventName: string;
  enabled?: boolean;
  onData?: (data: T, meta: SSEEventMeta) => void;
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

  const connect = () => {
    if (!clientRef.current) return;

    setError(null);
    clientRef.current.connect(url);
  };

  const disconnect = () => {
    clientRef.current?.disconnect();
  };

  const reconnect = () => {
    disconnect();
    connect();
  };

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
    // registeredUrl: 이 effect 인스턴스가 구독을 시작한 시점의 url을 클로저로 캡쳐.
    // EventSource.close() 이후에도 이미 dispatch queue에 들어간 message 이벤트는
    // 처리될 수 있어, 콜백 측에서 등록 시점 url을 알아야 stale 이벤트를 식별할 수 있음.
    const registeredUrl = url;
    const unsubscribeEvent = client.on<T>(eventName, (eventData) => {
      setData(eventData);
      setError(null);
      onDataRef.current?.(eventData, { url: registeredUrl });
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
