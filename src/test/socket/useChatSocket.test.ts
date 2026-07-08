/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act, waitFor } from "@testing-library/react";

import type { ConnectionStatus } from "@/lib/socket/types";
import { useChatSocket } from "@/lib/socket/useChatSocket";

const mockConnect = jest.fn();
const mockDisconnect = jest.fn();
let statusListeners: Set<(status: ConnectionStatus) => void>;

jest.mock("@/lib/socket/client", () => ({
  createChatSocket: jest.fn(() => ({
    connect: mockConnect,
    disconnect: mockDisconnect,
    send: jest.fn(),
    on: (event: string, callback: any) => {
      if (event === "status") statusListeners.add(callback);
      return () => statusListeners.delete(callback);
    },
    get status() {
      return "idle" as ConnectionStatus;
    },
  })),
}));

beforeEach(() => {
  statusListeners = new Set();
  jest.clearAllMocks();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("useChatSocket — 토큰 요청 처리", () => {
  it("토큰을 받으면 sessionId·accessToken으로 소켓을 연결한다", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ accessToken: "tok-abc" }),
    }) as any;

    renderHook(() => useChatSocket({ sessionId: "42" }));

    await waitFor(() => expect(mockConnect).toHaveBeenCalledWith("42", "tok-abc"));
  });

  it("토큰 응답이 안 오면 타임아웃(10초)에 abort되어 status가 disconnected로 바뀐다", async () => {
    jest.useFakeTimers();
    // signal이 abort되면 그때 reject하는, 스스로는 끝나지 않는 fetch
    global.fetch = jest.fn(
      (_url, init) =>
        new Promise((_, reject) => {
          (init as RequestInit).signal?.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError"))
          );
        })
    ) as any;

    const { result } = renderHook(() => useChatSocket({ sessionId: "42" }));
    expect(result.current.status).toBe("idle");

    await act(async () => {
      jest.advanceTimersByTime(10000);
    });

    expect(result.current.status).toBe("disconnected");
    expect(mockConnect).not.toHaveBeenCalled();
  });

  it("언마운트 시 진행 중인 요청을 abort하고 소켓을 정리한다", () => {
    let capturedSignal: AbortSignal | undefined;
    global.fetch = jest.fn((_url, init) => {
      capturedSignal = (init as RequestInit).signal ?? undefined;
      return new Promise(() => {}); // 영원히 pending
    }) as any;

    const { unmount } = renderHook(() => useChatSocket({ sessionId: "42" }));
    unmount();

    expect(capturedSignal?.aborted).toBe(true);
    expect(mockDisconnect).toHaveBeenCalled();
    expect(mockConnect).not.toHaveBeenCalled();
  });
});
