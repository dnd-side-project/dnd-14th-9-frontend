/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act } from "@testing-library/react";

import { useWaitingMembersSSE } from "@/features/lobby/hooks/useWaitingMembersSSE";
import type { WaitingMembersEventData } from "@/features/lobby/types";
import type { SSEConnectionStatus, SSEError } from "@/lib/sse/types";

// SSEClient Mock
type EventCallback = (data: any) => void;
type StatusCallback = (status: SSEConnectionStatus) => void;

const mockConnect = jest.fn();
const mockDisconnect = jest.fn();
const mockOn = jest.fn();
const mockOnStatusChange = jest.fn();

let eventListeners: Map<string, Set<EventCallback>>;
let statusListeners: Set<StatusCallback>;
let currentStatus: SSEConnectionStatus;

jest.mock("@/lib/sse/client", () => ({
  SSEClient: jest.fn().mockImplementation(() => {
    eventListeners = new Map();
    statusListeners = new Set();
    currentStatus = "idle";

    return {
      connect: mockConnect.mockImplementation(() => {
        currentStatus = "connecting";
        statusListeners.forEach((cb) => cb("connecting"));

        // 자동으로 connected 상태로 전환 (시뮬레이션)
        setTimeout(() => {
          currentStatus = "connected";
          statusListeners.forEach((cb) => cb("connected"));
        }, 0);
      }),
      disconnect: mockDisconnect.mockImplementation(() => {
        currentStatus = "idle";
        statusListeners.forEach((cb) => cb("idle"));
      }),
      on: mockOn.mockImplementation((eventName: string, callback: EventCallback) => {
        if (!eventListeners.has(eventName)) {
          eventListeners.set(eventName, new Set());
        }
        eventListeners.get(eventName)!.add(callback);

        return () => {
          eventListeners.get(eventName)?.delete(callback);
        };
      }),
      onStatusChange: mockOnStatusChange.mockImplementation((callback: StatusCallback) => {
        statusListeners.add(callback);
        return () => statusListeners.delete(callback);
      }),
      get status() {
        return currentStatus;
      },
    };
  }),
}));

// 테스트 헬퍼 함수
function simulateSSEEvent(eventName: string, data: unknown) {
  eventListeners.get(eventName)?.forEach((callback) => callback(data));
}

function simulateStatusChange(status: SSEConnectionStatus) {
  currentStatus = status;
  statusListeners.forEach((callback) => callback(status));
}

beforeEach(() => {
  jest.clearAllMocks();
  eventListeners = new Map();
  statusListeners = new Set();
  currentStatus = "idle";
});

describe("useWaitingMembersSSE", () => {
  describe("초기 상태", () => {
    it("초기 data는 null이어야 합니다", () => {
      const { result } = renderHook(() =>
        useWaitingMembersSSE({
          sessionId: "test-session",
          enabled: false,
        })
      );

      expect(result.current.data).toBeNull();
    });

    it("enabled가 false일 때 status는 idle이어야 합니다", () => {
      const { result } = renderHook(() =>
        useWaitingMembersSSE({
          sessionId: "test-session",
          enabled: false,
        })
      );

      expect(result.current.status).toBe("idle");
    });

    it("초기 error는 null이어야 합니다", () => {
      const { result } = renderHook(() =>
        useWaitingMembersSSE({
          sessionId: "test-session",
          enabled: false,
        })
      );

      expect(result.current.error).toBeNull();
    });
  });

  describe("연결", () => {
    it("enabled가 true일 때 SSE에 연결해야 합니다", () => {
      renderHook(() =>
        useWaitingMembersSSE({
          sessionId: "test-session",
          enabled: true,
        })
      );

      expect(mockConnect).toHaveBeenCalledWith("/api/sse/waiting/test-session");
    });

    it("enabled가 false일 때 SSE에 연결하지 않아야 합니다", () => {
      renderHook(() =>
        useWaitingMembersSSE({
          sessionId: "test-session",
          enabled: false,
        })
      );

      expect(mockConnect).not.toHaveBeenCalled();
    });

    it("sessionId가 없을 때 SSE에 연결하지 않아야 합니다", () => {
      renderHook(() =>
        useWaitingMembersSSE({
          sessionId: "",
          enabled: true,
        })
      );

      expect(mockConnect).not.toHaveBeenCalled();
    });

    it("연결 시 올바른 이벤트 리스너를 등록해야 합니다", () => {
      renderHook(() =>
        useWaitingMembersSSE({
          sessionId: "test-session",
          enabled: true,
        })
      );

      expect(mockOn).toHaveBeenCalledWith("waiting-members-updated", expect.any(Function));
      expect(mockOn).toHaveBeenCalledWith("error", expect.any(Function));
      expect(mockOnStatusChange).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe("이벤트 수신", () => {
    it("waiting-members-updated 이벤트 수신 시 data가 업데이트되어야 합니다", async () => {
      const { result } = renderHook(() =>
        useWaitingMembersSSE({
          sessionId: "test-session",
          enabled: true,
        })
      );

      const mockData: WaitingMembersEventData = {
        participantCount: 3,
        members: [
          {
            memberId: 1,
            nickname: "테스터",
            profileImageUrl: "https://example.com/image.jpg",
            focusRate: 80,
            achievementRate: 90,
            role: "HOST",
            task: null,
          },
        ],
      };

      act(() => {
        simulateSSEEvent("waiting-members-updated", mockData);
      });

      expect(result.current.data).toEqual(mockData);
    });

    it("error 이벤트 수신 시 error가 업데이트되어야 합니다", () => {
      const { result } = renderHook(() =>
        useWaitingMembersSSE({
          sessionId: "test-session",
          enabled: true,
        })
      );

      const mockError: SSEError = {
        code: "CONNECTION_FAILED",
        message: "연결 실패",
      };

      act(() => {
        simulateSSEEvent("error", mockError);
      });

      expect(result.current.error).toEqual(mockError);
    });

    it("error 이벤트 수신 시 onError 콜백이 호출되어야 합니다", () => {
      const onError = jest.fn();

      renderHook(() =>
        useWaitingMembersSSE({
          sessionId: "test-session",
          enabled: true,
          onError,
        })
      );

      const mockError: SSEError = {
        code: "CONNECTION_FAILED",
        message: "연결 실패",
      };

      act(() => {
        simulateSSEEvent("error", mockError);
      });

      expect(onError).toHaveBeenCalledWith(mockError);
    });
  });

  describe("상태 변경", () => {
    it("상태 변경 시 status가 업데이트되어야 합니다", async () => {
      const { result } = renderHook(() =>
        useWaitingMembersSSE({
          sessionId: "test-session",
          enabled: true,
        })
      );

      act(() => {
        simulateStatusChange("connected");
      });

      expect(result.current.status).toBe("connected");
    });
  });

  describe("disconnect", () => {
    it("disconnect 호출 시 SSE 연결이 해제되어야 합니다", () => {
      const { result } = renderHook(() =>
        useWaitingMembersSSE({
          sessionId: "test-session",
          enabled: true,
        })
      );

      act(() => {
        result.current.disconnect();
      });

      expect(mockDisconnect).toHaveBeenCalled();
    });
  });

  describe("reconnect", () => {
    it("reconnect 호출 시 disconnect 후 connect가 호출되어야 합니다", () => {
      const { result } = renderHook(() =>
        useWaitingMembersSSE({
          sessionId: "test-session",
          enabled: true,
        })
      );

      mockConnect.mockClear();
      mockDisconnect.mockClear();

      act(() => {
        result.current.reconnect();
      });

      expect(mockDisconnect).toHaveBeenCalled();
      expect(mockConnect).toHaveBeenCalled();
    });
  });

  describe("cleanup", () => {
    it("언마운트 시 SSE 연결이 해제되어야 합니다", () => {
      const { unmount } = renderHook(() =>
        useWaitingMembersSSE({
          sessionId: "test-session",
          enabled: true,
        })
      );

      unmount();

      expect(mockDisconnect).toHaveBeenCalled();
    });
  });

  describe("sessionId 변경", () => {
    it("sessionId 변경 시 새로운 URL로 재연결해야 합니다", () => {
      const { rerender } = renderHook(
        ({ sessionId }) =>
          useWaitingMembersSSE({
            sessionId,
            enabled: true,
          }),
        {
          initialProps: { sessionId: "session-1" },
        }
      );

      expect(mockConnect).toHaveBeenCalledWith("/api/sse/waiting/session-1");

      mockConnect.mockClear();

      rerender({ sessionId: "session-2" });

      expect(mockDisconnect).toHaveBeenCalled();
      expect(mockConnect).toHaveBeenCalledWith("/api/sse/waiting/session-2");
    });
  });

  describe("enabled 변경", () => {
    it("enabled가 false에서 true로 변경되면 연결해야 합니다", () => {
      const { rerender } = renderHook(
        ({ enabled }) =>
          useWaitingMembersSSE({
            sessionId: "test-session",
            enabled,
          }),
        {
          initialProps: { enabled: false },
        }
      );

      expect(mockConnect).not.toHaveBeenCalled();

      rerender({ enabled: true });

      expect(mockConnect).toHaveBeenCalledWith("/api/sse/waiting/test-session");
    });

    it("enabled가 true에서 false로 변경되면 연결을 해제해야 합니다", () => {
      const { rerender } = renderHook(
        ({ enabled }) =>
          useWaitingMembersSSE({
            sessionId: "test-session",
            enabled,
          }),
        {
          initialProps: { enabled: true },
        }
      );

      mockDisconnect.mockClear();

      rerender({ enabled: false });

      expect(mockDisconnect).toHaveBeenCalled();
    });
  });
});
