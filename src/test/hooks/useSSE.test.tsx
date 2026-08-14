import { act, renderHook } from "@testing-library/react";

import { acquireSSEClient, releaseSSEClient } from "@/lib/sse/shared-client";
import type { SSEConnectionStatus, SSEEventCallback } from "@/lib/sse/types";
import { useSSE } from "@/lib/sse/useSSE";

jest.mock("@/lib/sse/shared-client", () => ({
  acquireSSEClient: jest.fn(),
  releaseSSEClient: jest.fn(),
}));

const acquireMock = acquireSSEClient as jest.Mock;
const releaseMock = releaseSSEClient as jest.Mock;

/** SSEClient의 구독/상태 통지 동작만 흉내 내는 목 클라이언트 */
function createMockClient(initialStatus: SSEConnectionStatus = "connected") {
  const listeners = new Map<string, Set<SSEEventCallback<unknown>>>();
  const statusListeners = new Set<(status: SSEConnectionStatus) => void>();

  const client = {
    status: initialStatus,
    connect: jest.fn(),
    on: jest.fn((eventName: string, callback: SSEEventCallback<unknown>) => {
      if (!listeners.has(eventName)) {
        listeners.set(eventName, new Set());
      }
      listeners.get(eventName)!.add(callback);
      return () => listeners.get(eventName)?.delete(callback);
    }),
    onStatusChange: jest.fn((callback: (status: SSEConnectionStatus) => void) => {
      statusListeners.add(callback);
      callback(client.status);
      return () => statusListeners.delete(callback);
    }),
    emit(eventName: string, data: unknown) {
      listeners.get(eventName)?.forEach((callback) => callback(data, { replayed: false }));
    },
    setStatus(status: SSEConnectionStatus) {
      client.status = status;
      statusListeners.forEach((callback) => callback(status));
    },
  };

  return client;
}

describe("useSSE", () => {
  let mockClient: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = createMockClient();
    acquireMock.mockImplementation(() => mockClient);
  });

  it("마운트 시 구독하고 이벤트를 수신한다", () => {
    const { result } = renderHook(() =>
      useSSE<{ value: number }>({ url: "/sse", eventName: "evt" })
    );

    expect(acquireMock).toHaveBeenCalledWith("/sse");
    expect(result.current.status).toBe("connected");

    act(() => {
      mockClient.emit("evt", { value: 1 });
    });

    expect(result.current.data).toEqual({ value: 1 });
  });

  it("disconnect() 후에는 구독이 해제되고 이벤트를 받지 않는다", () => {
    const { result } = renderHook(() =>
      useSSE<{ value: number }>({ url: "/sse", eventName: "evt" })
    );

    act(() => {
      result.current.disconnect();
    });

    expect(result.current.status).toBe("idle");
    expect(releaseMock).toHaveBeenCalledWith("/sse");

    act(() => {
      mockClient.emit("evt", { value: 2 });
    });

    expect(result.current.data).toBeNull();
  });

  it("별도 배치의 disconnect() → reconnect()는 다시 구독한다", () => {
    const { result } = renderHook(() =>
      useSSE<{ value: number }>({ url: "/sse", eventName: "evt" })
    );

    act(() => {
      result.current.disconnect();
    });
    act(() => {
      result.current.reconnect();
    });

    expect(acquireMock).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe("connected");

    act(() => {
      mockClient.emit("evt", { value: 3 });
    });

    expect(result.current.data).toEqual({ value: 3 });
  });

  it("같은 배치의 disconnect() → reconnect()는 구독을 유지한다", () => {
    const { result } = renderHook(() =>
      useSSE<{ value: number }>({ url: "/sse", eventName: "evt" })
    );

    // setPaused(true)가 반영되기 전에 reconnect()가 호출되는 케이스.
    // pausedRef 없이는 이전 렌더의 paused === false를 읽어 재개하지 못하고
    // 이후 effect cleanup으로 구독이 해제된 채 남는다.
    act(() => {
      result.current.disconnect();
      result.current.reconnect();
    });

    expect(releaseMock).not.toHaveBeenCalled();
    expect(result.current.status).toBe("connected");

    act(() => {
      mockClient.emit("evt", { value: 4 });
    });

    expect(result.current.data).toEqual({ value: 4 });
  });

  it("공유 커넥션이 끊긴 상태의 reconnect()는 물리 재연결을 요청한다", () => {
    const { result } = renderHook(() =>
      useSSE<{ value: number }>({ url: "/sse", eventName: "evt" })
    );

    act(() => {
      mockClient.setStatus("disconnected");
    });

    act(() => {
      result.current.reconnect();
    });

    expect(mockClient.connect).toHaveBeenCalledWith("/sse");
  });
});
