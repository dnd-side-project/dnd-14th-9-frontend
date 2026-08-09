/* eslint-disable @typescript-eslint/no-explicit-any */
import { act, renderHook } from "@testing-library/react";

import { useReactionSummarySSE } from "@/features/session/hooks/useReactionSummarySSE";
import { resetSharedSSEClients } from "@/lib/sse/shared-client";

/**
 * 실제 SSEClient를 그대로 쓰고 EventSource만 모킹한다.
 * 공유 클라이언트 도입으로 connect()가 on()보다 먼저 호출되도록 순서가 바뀌었기 때문에,
 * named 이벤트 리스너가 EventSource에 실제로 등록되는지를 통합적으로 검증한다.
 */
class MockEventSource {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSED = 2;

  url: string;
  readyState: number = MockEventSource.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;

  private listeners = new Map<string, ((event: Event) => void)[]>();

  constructor(url: string) {
    this.url = url;
  }

  addEventListener(type: string, listener: (event: Event) => void) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type)!.push(listener);
  }

  removeEventListener() {}

  close() {
    this.readyState = MockEventSource.CLOSED;
  }

  simulateOpen() {
    this.readyState = MockEventSource.OPEN;
    this.onopen?.(new Event("open"));
  }

  /** 백엔드가 보내는 원본 프레임(event 이름 + data 문자열)을 그대로 재현한다. */
  simulateRawEvent(eventName: string, rawData: string) {
    const event = new MessageEvent(eventName, { data: rawData });
    this.listeners.get(eventName)?.forEach((listener) => listener(event));
  }
}

let instance: MockEventSource | null = null;

beforeEach(() => {
  resetSharedSSEClients();
  instance = null;
  (global as any).EventSource = jest.fn((url: string) => {
    instance = new MockEventSource(url);
    return instance;
  });
  (global as any).EventSource.CONNECTING = MockEventSource.CONNECTING;
  (global as any).EventSource.OPEN = MockEventSource.OPEN;
  (global as any).EventSource.CLOSED = MockEventSource.CLOSED;
});

// 백엔드 실제 응답 프레임
const RAW_PAYLOAD =
  '{"total":{"heartCount":1,"starCount":0,"thumbsUpCount":1,"thumbsDownCount":0},' +
  '"my":{"heartCount":1,"starCount":0,"thumbsUpCount":0,"thumbsDownCount":0}}';

describe("useReactionSummarySSE", () => {
  it("통합 리액션 채널 URL로 연결해야 합니다", () => {
    renderHook(() => useReactionSummarySSE({ sessionId: "900" }));

    expect(global.EventSource).toHaveBeenCalledWith("/api/sse/reactions/900", {
      withCredentials: true,
    });
  });

  // 명세는 reaction-summary-updated인데 배포된 백엔드는 reaction-updated를 보낸다.
  // 이름이 하나라도 어긋나면 EventSource가 dispatch하지 않아 갱신이 통째로 누락되므로 둘 다 구독한다.
  it("명세/실제 이벤트 이름을 모두 EventSource에 등록해야 합니다", () => {
    renderHook(() => useReactionSummarySSE({ sessionId: "900" }));

    act(() => instance!.simulateOpen());

    expect((instance as any).listeners.has("reaction-summary-updated")).toBe(true);
    expect((instance as any).listeners.has("reaction-updated")).toBe(true);
  });

  it.each(["reaction-summary-updated", "reaction-updated"])(
    "%s 수신 시 total/my가 그대로 노출되어야 합니다",
    (eventName) => {
      const { result } = renderHook(() => useReactionSummarySSE({ sessionId: "900" }));

      act(() => {
        instance!.simulateOpen();
        instance!.simulateRawEvent(eventName, RAW_PAYLOAD);
      });

      expect(result.current.data).toEqual({
        total: { heartCount: 1, starCount: 0, thumbsUpCount: 1, thumbsDownCount: 0 },
        my: { heartCount: 1, starCount: 0, thumbsUpCount: 0, thumbsDownCount: 0 },
      });
    }
  );

  it("이벤트 이름 배열을 매 렌더 새로 만들어도 재연결하지 않아야 합니다", () => {
    const { rerender } = renderHook(() => useReactionSummarySSE({ sessionId: "900" }));

    rerender();
    rerender();

    expect(global.EventSource).toHaveBeenCalledTimes(1);
  });
});
