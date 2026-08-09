"use client";

import { useEffect, useRef, useState } from "react";

import { acquireSSEClient, releaseSSEClient } from "./shared-client";

import type { SSEClient } from "./client";
import type { SSEConnectionStatus, SSEError } from "./types";

export interface SSEEventMeta {
  /** 이벤트 리스너가 등록된 시점의 url (in-flight 이벤트 race 검증용) */
  url: string;
  /** 실시간 수신이 아니라 캐시된 마지막 이벤트를 재생한 것인지 여부 */
  replayed: boolean;
}

interface UseSSEOptions<T> {
  url: string;
  eventName: string;
  enabled?: boolean;
  /**
   * 구독 시작 시 공유 클라이언트가 캐시해 둔 마지막 이벤트를 재생할지 여부.
   *
   * 통합 room 채널처럼 커넥션을 공유하는 경우, 늦게 마운트된 훅은 구독 직후
   * 백엔드가 보내주는 초기 이벤트를 이미 놓친 상태다. 최신 상태를 그대로 쓰는
   * 이벤트(상태/참여자 목록)라면 켜두는 것이 안전하다.
   */
  replayLastEvent?: boolean;
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
  replayLastEvent = false,
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

    // 같은 url을 구독하는 훅끼리 커넥션 1개를 공유한다 (참조 카운트로 수명 관리).
    const client = acquireSSEClient(url);
    clientRef.current = client;

    // 상태 변경 리스너 - 구독 즉시 현재 상태가 한 번 전달되므로,
    // 이미 연결된 공유 클라이언트에 늦게 합류해도 status가 맞춰진다.
    // 연결 시작 시에는 이전 에러를 초기화한다.
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
    // replayLast: 공유 커넥션에 늦게 합류해 초기 이벤트를 놓친 경우,
    // 클라이언트가 캐시해 둔 마지막 payload를 구독 즉시 재생한다.
    const registeredUrl = url;
    const unsubscribeEvent = client.on<T>(
      eventName,
      (eventData, delivery) => {
        setData(eventData);
        setError(null);
        onDataRef.current?.(eventData, { url: registeredUrl, replayed: delivery.replayed });
      },
      { replayLast: replayLastEvent }
    );

    // 에러 리스너
    const unsubscribeError = client.on<SSEError>("error", (sseError) => {
      setError(sseError);
      onErrorRef.current?.(sseError);
    });

    // cleanup
    return () => {
      unsubscribeStatus();
      unsubscribeEvent();
      unsubscribeError();
      clientRef.current = null;
      releaseSSEClient(url);
    };
  }, [url, eventName, enabled, replayLastEvent]);

  return {
    data,
    status,
    error,
    reconnect,
    disconnect,
  };
}
