/* eslint-disable @typescript-eslint/no-explicit-any */
import { act, render, screen } from "@testing-library/react";

import { RealtimeMemberEmojiCard } from "@/features/session/components/SessionResult/RealtimeMemberEmojiCard";
import { RealtimeSessionEmojiCard } from "@/features/session/components/SessionResult/RealtimeSessionEmojiCard";
import { resetSharedSSEClients } from "@/lib/sse/shared-client";

/**
 * 실제 SSEClient/훅을 그대로 쓰고 EventSource만 모킹해,
 * 백엔드 프레임이 "받은 이모지" 카드까지 도달하는지 통합 검증한다.
 */
class MockEventSource {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSED = 2;

  readyState: number = MockEventSource.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;

  private listeners = new Map<string, ((event: Event) => void)[]>();

  constructor(public url: string) {}

  addEventListener(type: string, listener: (event: Event) => void) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type)!.push(listener);
  }

  removeEventListener() {}

  close() {
    this.readyState = MockEventSource.CLOSED;
  }

  emitFrame(eventName: string, rawData: string) {
    this.readyState = MockEventSource.OPEN;
    this.onopen?.(new Event("open"));
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

const EMPTY_INITIAL = [
  { emojiName: "HEART" as const, count: 0 },
  { emojiName: "THUMBS_UP" as const, count: 0 },
  { emojiName: "THUMBS_DOWN" as const, count: 0 },
  { emojiName: "STAR" as const, count: 0 },
];

describe("받은 이모지 카드 실시간 갱신", () => {
  it("SSE 수신 전에는 초기 REST 데이터를 보여줍니다", () => {
    render(<RealtimeMemberEmojiCard sessionId="900" initialEmojis={EMPTY_INITIAL} />);

    expect(screen.getByText("아직 받은 리액션이 없어요")).toBeInTheDocument();
  });

  // 명세는 reaction-summary-updated, 배포된 백엔드는 reaction-updated를 보낸다.
  // 어느 쪽이 오든 동일하게 반영되어야 한다.
  it.each(["reaction-summary-updated", "reaction-updated"])(
    "나의 리포트 카드는 %s 이벤트의 my 집계를 반영합니다",
    (eventName) => {
      render(<RealtimeMemberEmojiCard sessionId="900" initialEmojis={EMPTY_INITIAL} />);

      act(() => instance!.emitFrame(eventName, RAW_PAYLOAD));

      // my: 하트 1 → 최상위 이모지로 노출
      expect(screen.queryByText("아직 받은 리액션이 없어요")).not.toBeInTheDocument();
      expect(screen.getByText("하트를 제일 많이 받았어요!")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument();
    }
  );

  it.each(["reaction-summary-updated", "reaction-updated"])(
    "참여자 리포트 카드는 %s 이벤트의 total 집계를 반영합니다",
    (eventName) => {
      render(<RealtimeSessionEmojiCard sessionId="900" initialEmojis={EMPTY_INITIAL} />);

      act(() => instance!.emitFrame(eventName, RAW_PAYLOAD));

      // total: 하트 1 + 좋아요 1 → 합계 2개가 노출되어야 한다
      expect(screen.queryByText("아직 받은 리액션이 없어요")).not.toBeInTheDocument();
      expect(screen.getAllByText("1")).toHaveLength(2);
    }
  );

  it("리액션 클릭 후 재전송된 집계로 갱신됩니다", () => {
    render(<RealtimeSessionEmojiCard sessionId="900" initialEmojis={EMPTY_INITIAL} />);

    act(() => instance!.emitFrame("reaction-updated", RAW_PAYLOAD));
    expect(screen.getAllByText("1")).toHaveLength(2);

    // 하트를 눌러 백엔드가 갱신된 집계를 재전송한 상황
    act(() =>
      instance!.emitFrame(
        "reaction-updated",
        '{"total":{"heartCount":5,"starCount":0,"thumbsUpCount":1,"thumbsDownCount":0},' +
          '"my":{"heartCount":0,"starCount":0,"thumbsUpCount":1,"thumbsDownCount":0}}'
      )
    );

    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("하트를 제일 많이 받았어요!")).toBeInTheDocument();
  });

  it("event 이름이 없는 프레임은 수신되지 않습니다 (백엔드 프레임 규약 확인용)", () => {
    render(<RealtimeMemberEmojiCard sessionId="900" initialEmojis={EMPTY_INITIAL} />);

    act(() => instance!.emitFrame("message", RAW_PAYLOAD));

    expect(screen.getByText("아직 받은 리액션이 없어요")).toBeInTheDocument();
  });
});
