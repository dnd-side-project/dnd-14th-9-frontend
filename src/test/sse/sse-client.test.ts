/* eslint-disable @typescript-eslint/no-explicit-any */
import { SSEClient } from "@/lib/sse/client";
import type { SSEConnectionStatus } from "@/lib/sse/types";

// EventSource Mock
class MockEventSource {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSED = 2;

  url: string;
  readyState: number = MockEventSource.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;

  private listeners: Map<string, ((event: Event) => void)[]> = new Map();

  constructor(url: string) {
    this.url = url;
  }

  addEventListener(type: string, listener: (event: Event) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(listener);
  }

  removeEventListener(type: string, listener: (event: Event) => void) {
    const listeners = this.listeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  close() {
    this.readyState = MockEventSource.CLOSED;
  }

  // 테스트 헬퍼 메서드
  simulateOpen() {
    this.readyState = MockEventSource.OPEN;
    this.onopen?.(new Event("open"));
  }

  simulateError() {
    this.onerror?.(new Event("error"));
  }

  simulateMessage(data: unknown) {
    const event = new MessageEvent("message", {
      data: JSON.stringify(data),
    });
    this.onmessage?.(event);
  }

  simulateNamedEvent(eventName: string, data: unknown) {
    const event = new MessageEvent(eventName, {
      data: JSON.stringify(data),
    });
    this.listeners.get(eventName)?.forEach((listener) => listener(event));
  }

  // 테스트용: 특정 이벤트에 등록된 리스너 수 반환
  getListenerCount(eventName: string): number {
    return this.listeners.get(eventName)?.length ?? 0;
  }
}

// Global EventSource Mock
let mockEventSourceInstance: MockEventSource | null = null;

beforeEach(() => {
  mockEventSourceInstance = null;
  (global as any).EventSource = jest.fn((url: string) => {
    mockEventSourceInstance = new MockEventSource(url);
    return mockEventSourceInstance;
  });
  (global as any).EventSource.CONNECTING = MockEventSource.CONNECTING;
  (global as any).EventSource.OPEN = MockEventSource.OPEN;
  (global as any).EventSource.CLOSED = MockEventSource.CLOSED;
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("SSEClient", () => {
  describe("초기 상태", () => {
    it("초기 status는 idle이어야 합니다", () => {
      const client = new SSEClient();
      expect(client.status).toBe("idle");
    });
  });

  describe("connect", () => {
    it("connect 호출 시 status가 connecting으로 변경되어야 합니다", () => {
      const client = new SSEClient();
      client.connect("/api/sse/test");

      expect(client.status).toBe("connecting");
    });

    it("connect 호출 시 EventSource가 올바른 URL로 생성되어야 합니다", () => {
      const client = new SSEClient();
      client.connect("/api/sse/test");

      expect(global.EventSource).toHaveBeenCalledWith("/api/sse/test");
    });

    it("연결 성공 시 status가 connected로 변경되어야 합니다", () => {
      const client = new SSEClient();
      client.connect("/api/sse/test");

      mockEventSourceInstance!.simulateOpen();

      expect(client.status).toBe("connected");
    });

    it("이미 연결된 상태에서 connect 호출 시 무시되어야 합니다", () => {
      const client = new SSEClient();
      client.connect("/api/sse/test");
      mockEventSourceInstance!.simulateOpen();

      client.connect("/api/sse/another");

      expect(global.EventSource).toHaveBeenCalledTimes(1);
    });
  });

  describe("disconnect", () => {
    it("disconnect 호출 시 status가 idle로 변경되어야 합니다", () => {
      const client = new SSEClient();
      client.connect("/api/sse/test");
      mockEventSourceInstance!.simulateOpen();

      client.disconnect();

      expect(client.status).toBe("idle");
    });

    it("disconnect 호출 시 EventSource가 close되어야 합니다", () => {
      const client = new SSEClient();
      client.connect("/api/sse/test");
      const closeSpy = jest.spyOn(mockEventSourceInstance!, "close");

      client.disconnect();

      expect(closeSpy).toHaveBeenCalled();
    });
  });

  describe("on/off 이벤트 리스너", () => {
    it("on으로 등록한 리스너가 이벤트 수신 시 호출되어야 합니다", () => {
      const client = new SSEClient();
      const callback = jest.fn();

      client.on("waiting-members-updated", callback);
      client.connect("/api/sse/test");
      mockEventSourceInstance!.simulateOpen();
      mockEventSourceInstance!.simulateNamedEvent("waiting-members-updated", {
        participantCount: 3,
        members: [],
      });

      expect(callback).toHaveBeenCalledWith({
        participantCount: 3,
        members: [],
      });
    });

    it("on은 unsubscribe 함수를 반환해야 합니다", () => {
      const client = new SSEClient();
      const callback = jest.fn();

      const unsubscribe = client.on("test-event", callback);

      expect(typeof unsubscribe).toBe("function");
    });

    it("unsubscribe 호출 후 이벤트가 더 이상 호출되지 않아야 합니다", () => {
      const client = new SSEClient();
      const callback = jest.fn();

      const unsubscribe = client.on("test-event", callback);
      client.connect("/api/sse/test");
      mockEventSourceInstance!.simulateOpen();

      unsubscribe();
      mockEventSourceInstance!.simulateNamedEvent("test-event", { data: "test" });

      expect(callback).not.toHaveBeenCalled();
    });

    it("off로 특정 리스너를 제거할 수 있어야 합니다", () => {
      const client = new SSEClient();
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      client.on("test-event", callback1);
      client.on("test-event", callback2);
      client.connect("/api/sse/test");
      mockEventSourceInstance!.simulateOpen();

      client.off("test-event", callback1);
      mockEventSourceInstance!.simulateNamedEvent("test-event", { data: "test" });

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it("message 이벤트를 수신할 수 있어야 합니다", () => {
      const client = new SSEClient();
      const callback = jest.fn();

      client.on("message", callback);
      client.connect("/api/sse/test");
      mockEventSourceInstance!.simulateOpen();
      mockEventSourceInstance!.simulateMessage({ type: "test" });

      expect(callback).toHaveBeenCalledWith({ type: "test" });
    });
  });

  describe("onStatusChange", () => {
    it("상태 변경 시 콜백이 호출되어야 합니다", () => {
      const client = new SSEClient();
      const statusCallback = jest.fn();

      client.onStatusChange(statusCallback);
      client.connect("/api/sse/test");

      expect(statusCallback).toHaveBeenCalledWith("connecting");
    });

    it("여러 상태 변경을 추적할 수 있어야 합니다", () => {
      const client = new SSEClient();
      const statuses: SSEConnectionStatus[] = [];

      client.onStatusChange((status) => statuses.push(status));
      client.connect("/api/sse/test");
      mockEventSourceInstance!.simulateOpen();
      client.disconnect();

      expect(statuses).toEqual(["connecting", "connected", "idle"]);
    });

    it("unsubscribe 후 콜백이 호출되지 않아야 합니다", () => {
      const client = new SSEClient();
      const statusCallback = jest.fn();

      const unsubscribe = client.onStatusChange(statusCallback);
      unsubscribe();
      client.connect("/api/sse/test");

      expect(statusCallback).not.toHaveBeenCalled();
    });
  });

  describe("에러 처리", () => {
    it("연결 에러 시 error 이벤트가 발생해야 합니다", () => {
      const client = new SSEClient({ maxReconnectAttempts: 0 });
      const errorCallback = jest.fn();

      client.on("error", errorCallback);
      client.connect("/api/sse/test");
      mockEventSourceInstance!.simulateError();

      expect(errorCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "CONNECTION_FAILED",
        })
      );
    });

    it("연결 에러 시 status가 disconnected로 변경되어야 합니다", () => {
      const client = new SSEClient({ maxReconnectAttempts: 0 });

      client.connect("/api/sse/test");
      mockEventSourceInstance!.simulateError();

      expect(client.status).toBe("disconnected");
    });
  });

  describe("재연결", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("에러 발생 시 재연결을 시도해야 합니다", () => {
      const client = new SSEClient({
        maxReconnectAttempts: 3,
        reconnectInterval: 1000,
      });

      client.connect("/api/sse/test");
      mockEventSourceInstance!.simulateError();

      expect(client.status).toBe("reconnecting");

      jest.advanceTimersByTime(1000);

      expect(global.EventSource).toHaveBeenCalledTimes(2);
    });

    it("최대 재연결 시도 횟수를 초과하면 에러를 발생시켜야 합니다", () => {
      const client = new SSEClient({
        maxReconnectAttempts: 2,
        reconnectInterval: 1000,
      });
      const errorCallback = jest.fn();
      client.on("error", errorCallback);

      client.connect("/api/sse/test");

      // 첫 번째 에러 -> 재연결 시도 1
      mockEventSourceInstance!.simulateError();
      jest.advanceTimersByTime(1000);

      // 두 번째 에러 -> 재연결 시도 2
      mockEventSourceInstance!.simulateError();
      jest.advanceTimersByTime(2000);

      // 세 번째 에러 -> 최대 시도 초과
      mockEventSourceInstance!.simulateError();

      expect(errorCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "MAX_RECONNECT_REACHED",
        })
      );
    });
  });

  describe("removeAllListeners", () => {
    it("모든 리스너가 제거되어야 합니다", () => {
      const client = new SSEClient();
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const statusCallback = jest.fn();

      client.on("event1", callback1);
      client.on("event2", callback2);
      client.onStatusChange(statusCallback);

      client.removeAllListeners();
      client.connect("/api/sse/test");
      mockEventSourceInstance!.simulateOpen();
      mockEventSourceInstance!.simulateNamedEvent("event1", {});

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
      expect(statusCallback).not.toHaveBeenCalled();
    });
  });

  describe("중복 리스너 등록 방지", () => {
    it("같은 이벤트에 여러 콜백을 등록해도 EventSource에는 하나의 리스너만 등록되어야 합니다", () => {
      const client = new SSEClient();
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      client.on("waiting-members-updated", callback1);
      client.on("waiting-members-updated", callback2);
      client.on("waiting-members-updated", callback3);
      client.connect("/api/sse/test");
      mockEventSourceInstance!.simulateOpen();

      // EventSource에는 하나의 리스너만 등록되어야 함
      expect(mockEventSourceInstance!.getListenerCount("waiting-members-updated")).toBe(1);

      // 하지만 모든 콜백은 호출되어야 함
      mockEventSourceInstance!.simulateNamedEvent("waiting-members-updated", { data: "test" });

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
      expect(callback3).toHaveBeenCalledTimes(1);
    });

    it("연결된 상태에서 on 호출 시 EventSource에 중복 리스너가 등록되지 않아야 합니다", () => {
      const client = new SSEClient();
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      client.connect("/api/sse/test");
      mockEventSourceInstance!.simulateOpen();

      client.on("test-event", callback1);
      client.on("test-event", callback2);

      // EventSource에는 하나의 리스너만 등록되어야 함
      expect(mockEventSourceInstance!.getListenerCount("test-event")).toBe(1);

      // 이벤트 발생 시 모든 콜백은 정확히 한 번씩 호출되어야 함
      mockEventSourceInstance!.simulateNamedEvent("test-event", { data: "test" });

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it("재연결 시 EventSource에 중복 리스너가 등록되지 않아야 합니다", () => {
      jest.useFakeTimers();

      const client = new SSEClient({
        maxReconnectAttempts: 3,
        reconnectInterval: 1000,
      });
      const callback = jest.fn();

      client.on("test-event", callback);
      client.connect("/api/sse/test");
      mockEventSourceInstance!.simulateOpen();

      // 연결 끊김 및 재연결
      mockEventSourceInstance!.simulateError();
      jest.advanceTimersByTime(1000);
      mockEventSourceInstance!.simulateOpen();

      // 재연결 후에도 EventSource에는 하나의 리스너만 등록되어야 함
      expect(mockEventSourceInstance!.getListenerCount("test-event")).toBe(1);

      // 이벤트 발생 시 콜백은 정확히 한 번만 호출되어야 함
      mockEventSourceInstance!.simulateNamedEvent("test-event", { data: "test" });

      expect(callback).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });

    it("여러 번 재연결 후에도 콜백은 이벤트당 한 번만 호출되어야 합니다", () => {
      jest.useFakeTimers();

      const client = new SSEClient({
        maxReconnectAttempts: 5,
        reconnectInterval: 1000,
      });
      const callback = jest.fn();

      client.on("test-event", callback);
      client.connect("/api/sse/test");
      mockEventSourceInstance!.simulateOpen();

      // 3번 재연결 시뮬레이션
      for (let i = 0; i < 3; i++) {
        mockEventSourceInstance!.simulateError();
        jest.advanceTimersByTime(1000 * Math.pow(2, i));
        mockEventSourceInstance!.simulateOpen();
      }

      // EventSource에는 여전히 하나의 리스너만 등록되어야 함
      expect(mockEventSourceInstance!.getListenerCount("test-event")).toBe(1);

      // 이벤트 발생 시 콜백은 정확히 한 번만 호출되어야 함
      mockEventSourceInstance!.simulateNamedEvent("test-event", { data: "test" });

      expect(callback).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });
  });
});
