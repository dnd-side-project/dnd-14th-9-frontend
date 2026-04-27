"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { SSEConnectionStatus, SSEError } from "@/lib/sse/types";
import { useSSE } from "@/lib/sse/useSSE";

import type { WaitingMembersEventData, WaitingMembersSSEPayload } from "../types";

interface UseWaitingMembersSSEOptions {
  sessionId: string;
  enabled?: boolean;
  onError?: (error: SSEError) => void;
  onKicked?: (memberIds: number[]) => void;
}

interface UseWaitingMembersSSEReturn {
  data: WaitingMembersEventData | null;
  status: SSEConnectionStatus;
  error: SSEError | null;
  reconnect: () => void;
  disconnect: () => void;
}

export function useWaitingMembersSSE({
  sessionId,
  enabled = true,
  onError,
  onKicked,
}: UseWaitingMembersSSEOptions): UseWaitingMembersSSEReturn {
  const [roomData, setRoomData] = useState<WaitingMembersEventData | null>(null);
  const onKickedRef = useRef(onKicked);
  useEffect(() => {
    onKickedRef.current = onKicked;
  }, [onKicked]);

  const handleData = useCallback((payload: WaitingMembersSSEPayload) => {
    if (payload.eventType === "ROOM_UPDATE") {
      // members 필드가 누락된 비정상 payload는 무시 (런타임 가드)
      if (!payload.data || !Array.isArray(payload.data.members)) return;
      setRoomData(payload.data);
    } else if (payload.eventType === "KICKED") {
      if (!Array.isArray(payload.data?.memberIds)) return;
      onKickedRef.current?.(payload.data.memberIds);
    }
  }, []);

  const { status, error, reconnect, disconnect } = useSSE<WaitingMembersSSEPayload>({
    url: `/api/sse/waiting/${sessionId}`,
    eventName: "waiting-members-updated",
    enabled: enabled && !!sessionId,
    onData: handleData,
    onError,
  });

  return {
    data: roomData,
    status,
    error,
    reconnect,
    disconnect,
  };
}
