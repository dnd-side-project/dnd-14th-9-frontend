/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act } from "@testing-library/react";

import { useWaitingMembersSSE } from "@/features/lobby/hooks/useWaitingMembersSSE";
import type { WaitingMembersEventData } from "@/features/lobby/types";
import { resetSharedSSEClients } from "@/lib/sse/shared-client";
import type { SSEConnectionStatus, SSEError } from "@/lib/sse/types";

// SSEClient Mock
type EventCallback = (data: any, delivery?: { replayed: boolean }) => void;
type StatusCallback = (status: SSEConnectionStatus) => void;

const mockConnect = jest.fn();
const mockDisconnect = jest.fn();
const mockOn = jest.fn();
const mockOnStatusChange = jest.fn();

let eventListeners: Map<string, Set<EventCallback>>;
let statusListeners: Set<StatusCallback>;
let lastEvents: Map<string, unknown>;
let currentStatus: SSEConnectionStatus;

jest.mock("@/lib/sse/client", () => ({
  SSEClient: jest.fn().mockImplementation(() => {
    eventListeners = new Map();
    statusListeners = new Set();
    lastEvents = new Map();
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
        lastEvents.clear();
        statusListeners.forEach((cb) => cb("idle"));
      }),
      on: mockOn.mockImplementation(
        (eventName: string, callback: EventCallback, options?: { replayLast?: boolean }) => {
          if (!eventListeners.has(eventName)) {
            eventListeners.set(eventName, new Set());
          }
          eventListeners.get(eventName)!.add(callback);

          if (options?.replayLast && lastEvents.has(eventName)) {
            callback(lastEvents.get(eventName), { replayed: true });
          }

          return () => {
            eventListeners.get(eventName)?.delete(callback);
          };
        }
      ),
      onStatusChange: mockOnStatusChange.mockImplementation((callback: StatusCallback) => {
        statusListeners.add(callback);
        callback(currentStatus); // 실제 SSEClient와 동일하게 구독 즉시 현재 상태 전달
        return () => statusListeners.delete(callback);
      }),
      removeAllListeners: () => {
        eventListeners.clear();
        statusListeners.clear();
        lastEvents.clear();
      },
      get status() {
        return currentStatus;
      },
    };
  }),
}));

// 테스트 헬퍼 함수
function simulateSSEEvent(eventName: string, data: unknown) {
  // 실제 SSEClient와 동일하게 named 이벤트는 마지막 payload를 캐시한다.
  if (eventName !== "error") lastEvents.set(eventName, data);
  eventListeners.get(eventName)?.forEach((callback) => callback(data, { replayed: false }));
}

function simulateStatusChange(status: SSEConnectionStatus) {
  currentStatus = status;
  statusListeners.forEach((callback) => callback(status));
}

beforeEach(() => {
  resetSharedSSEClients();
  jest.clearAllMocks();
  eventListeners = new Map();
  statusListeners = new Set();
  lastEvents = new Map();
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

      expect(mockConnect).toHaveBeenCalledWith("/api/sse/room/test-session");
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

      expect(mockOn).toHaveBeenCalledWith("waiting-members-updated", expect.any(Function), {
        replayLast: true,
      });
      expect(mockOn).toHaveBeenCalledWith("error", expect.any(Function));
      expect(mockOnStatusChange).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe("이벤트 수신", () => {
    it("waiting-members-updated 이벤트(ROOM_UPDATE) 수신 시 data가 업데이트되어야 합니다", async () => {
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
        simulateSSEEvent("waiting-members-updated", { eventType: "ROOM_UPDATE", data: mockData });
      });

      expect(result.current.data).toEqual(mockData);
    });

    it("members 필드가 누락된 비정상 ROOM_UPDATE는 무시되어야 합니다", () => {
      const { result } = renderHook(() =>
        useWaitingMembersSSE({
          sessionId: "test-session",
          enabled: true,
        })
      );

      act(() => {
        simulateSSEEvent("waiting-members-updated", {
          eventType: "ROOM_UPDATE",
          data: { participantCount: 0 },
        });
      });

      expect(result.current.data).toBeNull();
    });

    it("KICKED 이벤트 수신 시 onKicked 콜백이 memberIds로 호출되어야 합니다", () => {
      const onKicked = jest.fn();

      renderHook(() =>
        useWaitingMembersSSE({
          sessionId: "test-session",
          enabled: true,
          onKicked,
        })
      );

      act(() => {
        simulateSSEEvent("waiting-members-updated", {
          eventType: "KICKED",
          data: { memberIds: [1, 2, 3] },
        });
      });

      expect(onKicked).toHaveBeenCalledWith([1, 2, 3]);
    });

    it("memberIds가 누락된 비정상 KICKED 이벤트는 onKicked가 호출되지 않아야 합니다", () => {
      const onKicked = jest.fn();

      renderHook(() =>
        useWaitingMembersSSE({
          sessionId: "test-session",
          enabled: true,
          onKicked,
        })
      );

      act(() => {
        simulateSSEEvent("waiting-members-updated", {
          eventType: "KICKED",
          data: {},
        });
      });

      expect(onKicked).not.toHaveBeenCalled();
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

      expect(mockConnect).toHaveBeenCalledWith("/api/sse/room/session-1");

      mockConnect.mockClear();

      rerender({ sessionId: "session-2" });

      expect(mockDisconnect).toHaveBeenCalled();
      expect(mockConnect).toHaveBeenCalledWith("/api/sse/room/session-2");
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

      expect(mockConnect).toHaveBeenCalledWith("/api/sse/room/test-session");
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

  describe("에러 상태 초기화", () => {
    it("새로운 연결 시작 시 이전 에러 상태가 초기화되어야 합니다", () => {
      const { result, rerender } = renderHook(
        ({ sessionId }) =>
          useWaitingMembersSSE({
            sessionId,
            enabled: true,
          }),
        {
          initialProps: { sessionId: "session-1" },
        }
      );

      // 에러 발생
      const mockError: SSEError = {
        code: "CONNECTION_FAILED",
        message: "연결 실패",
      };

      act(() => {
        simulateSSEEvent("error", mockError);
      });

      expect(result.current.error).toEqual(mockError);

      // sessionId 변경으로 재연결
      rerender({ sessionId: "session-2" });

      // 새로운 연결 시작 시 (connecting 상태) 에러가 초기화되어야 함
      act(() => {
        simulateStatusChange("connecting");
      });

      expect(result.current.error).toBeNull();
    });

    it("reconnect 호출 시 이전 에러 상태가 초기화되어야 합니다", () => {
      const { result } = renderHook(() =>
        useWaitingMembersSSE({
          sessionId: "test-session",
          enabled: true,
        })
      );

      // 에러 발생
      const mockError: SSEError = {
        code: "CONNECTION_FAILED",
        message: "연결 실패",
      };

      act(() => {
        simulateSSEEvent("error", mockError);
      });

      expect(result.current.error).toEqual(mockError);

      // reconnect 호출
      act(() => {
        result.current.reconnect();
      });

      // connecting 상태 전환 시 에러 초기화
      act(() => {
        simulateStatusChange("connecting");
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe("통합 room 채널 공유", () => {
    it("같은 세션을 구독하는 훅이 여러 개여도 커넥션은 1개만 열려야 합니다", () => {
      renderHook(() => {
        useWaitingMembersSSE({ sessionId: "test-session", enabled: true });
        useWaitingMembersSSE({ sessionId: "test-session", enabled: true });
      });

      expect(mockConnect).toHaveBeenCalledTimes(1);
      expect(mockConnect).toHaveBeenCalledWith("/api/sse/room/test-session");
    });

    it("구독자가 남아 있으면 하나가 언마운트돼도 연결을 끊지 않아야 합니다", () => {
      const { rerender } = renderHook(
        ({ showSecond }: { showSecond: boolean }) => {
          useWaitingMembersSSE({ sessionId: "test-session", enabled: true });
          useWaitingMembersSSE({ sessionId: "test-session", enabled: showSecond });
        },
        { initialProps: { showSecond: true } }
      );

      mockDisconnect.mockClear();
      rerender({ showSecond: false });

      expect(mockDisconnect).not.toHaveBeenCalled();
    });

    it("늦게 구독한 훅은 캐시된 마지막 ROOM_UPDATE를 재생받아야 합니다", () => {
      const mockData: WaitingMembersEventData = {
        participantCount: 1,
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

      const { result, rerender } = renderHook(
        ({ lateEnabled }: { lateEnabled: boolean }) => {
          useWaitingMembersSSE({ sessionId: "test-session", enabled: true });
          return useWaitingMembersSSE({ sessionId: "test-session", enabled: lateEnabled });
        },
        { initialProps: { lateEnabled: false } }
      );

      act(() => {
        simulateSSEEvent("waiting-members-updated", { eventType: "ROOM_UPDATE", data: mockData });
      });

      expect(result.current.data).toBeNull();

      rerender({ lateEnabled: true });

      expect(result.current.data).toEqual(mockData);
    });

    it("재생된 KICKED 이벤트로는 onKicked가 호출되지 않아야 합니다", () => {
      const onKicked = jest.fn();

      const { rerender } = renderHook(
        ({ lateEnabled }: { lateEnabled: boolean }) => {
          useWaitingMembersSSE({ sessionId: "test-session", enabled: true });
          useWaitingMembersSSE({ sessionId: "test-session", enabled: lateEnabled, onKicked });
        },
        { initialProps: { lateEnabled: false } }
      );

      act(() => {
        simulateSSEEvent("waiting-members-updated", {
          eventType: "KICKED",
          data: { memberIds: [1] },
        });
      });

      rerender({ lateEnabled: true });

      expect(onKicked).not.toHaveBeenCalled();
    });
  });
});
