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
  /**
   * 구독할 이벤트 이름. 배열을 주면 여러 이름을 동시에 구독하고,
   * 그중 무엇이 오든 같은 데이터로 취급한다.
   * (백엔드 이벤트명이 명세와 다르거나 과도기일 때 사용)
   */
  eventName: string | string[];
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
  /** 이 훅의 구독을 재개한다. 공유 커넥션이 끊겨 있을 때만 물리 재연결을 요청한다. */
  reconnect: () => void;
  /** 이 훅의 구독만 해제한다. 다른 구독자가 남아 있으면 공유 커넥션은 유지된다. */
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
  // 이 훅만 구독을 쉬는 상태. 공유 커넥션의 물리 연결 상태와는 별개다.
  const [paused, setPaused] = useState(false);
  // paused의 동기 미러. 같은 배치에서 disconnect() 직후 reconnect()가 호출되면
  // state는 아직 이전 값이므로, ref로 최신 pause 여부를 판단한다.
  const pausedRef = useRef(false);

  const clientRef = useRef<SSEClient | null>(null);
  const onDataRef = useRef(onData);
  const onErrorRef = useRef(onError);

  // 배열 리터럴을 매 렌더 새로 받아도 effect가 재실행되지 않도록 문자열 키로 정규화한다.
  // (SSE 이벤트 이름에는 쉼표가 쓰이지 않으므로 join/split으로 안전하게 왕복된다)
  const eventKey = (Array.isArray(eventName) ? eventName : [eventName]).join(",");

  useEffect(() => {
    onDataRef.current = onData;
  }, [onData]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  /**
   * 이 훅의 구독만 해제한다.
   *
   * 공유 커넥션(`acquireSSEClient`)을 직접 끊지 않는다. 같은 url을 구독하는 다른 훅이
   * 남아 있으면 물리 연결은 그대로 유지되고, 마지막 구독자가 빠지는 시점에
   * `releaseSSEClient`가 참조 카운트 0을 확인하고 실제로 끊는다.
   */
  const disconnect = () => {
    pausedRef.current = true;
    setPaused(true);
    setStatus("idle");
  };

  /**
   * 이 훅의 구독을 재개한다.
   *
   * pause 상태였다면 effect가 다시 구독하면서 `acquireSSEClient`가 idle/disconnected인
   * 공유 클라이언트를 되살린다. 구독 중인데 공유 커넥션만 끊긴 경우
   * (재연결 시도 소진 등)에만 물리 재연결을 직접 요청한다.
   */
  const reconnect = () => {
    setError(null);

    if (pausedRef.current) {
      pausedRef.current = false;
      setPaused(false);
      // 같은 배치에서 disconnect() 직후 호출되면 paused state가 실제로 바뀌지 않아
      // effect가 재실행되지 않는다. 이때는 구독이 살아 있으므로 클라이언트의
      // 현재 상태로 status만 되돌린다. (진짜 pause였다면 clientRef는 null이다)
      const client = clientRef.current;
      if (client) {
        setStatus(client.status);
      }
      return;
    }

    const client = clientRef.current;
    if (client && (client.status === "idle" || client.status === "disconnected")) {
      client.connect(url);
    }
  };

  useEffect(() => {
    if (!enabled || paused) return;

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
    const unsubscribeEvents = eventKey.split(",").map((name) =>
      client.on<T>(
        name,
        (eventData, delivery) => {
          setData(eventData);
          setError(null);
          onDataRef.current?.(eventData, { url: registeredUrl, replayed: delivery.replayed });
        },
        { replayLast: replayLastEvent }
      )
    );

    // 에러 리스너
    const unsubscribeError = client.on<SSEError>("error", (sseError) => {
      setError(sseError);
      onErrorRef.current?.(sseError);
    });

    // cleanup
    return () => {
      unsubscribeStatus();
      unsubscribeEvents.forEach((unsubscribe) => unsubscribe());
      unsubscribeError();
      clientRef.current = null;
      releaseSSEClient(url);
    };
  }, [url, eventKey, enabled, paused, replayLastEvent]);

  return {
    data,
    status,
    error,
    reconnect,
    disconnect,
  };
}
